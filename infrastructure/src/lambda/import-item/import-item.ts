import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import Ajv from 'ajv';
import * as foodSchema from '/opt/nodejs/foodSchema.json';
import * as ingredientSchema from '/opt/nodejs/ingredientSchema.json';
import { Food } from '../../../../website/src/models/Food';
import {
    RequestItemType,
    RequestPayload,
} from '../../../../website/src/models/RequestPayload';

const dynClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const tableName = process.env.TABLE_NAME;
const partitionKey = process.env.PARTITION_KEY;
const ajv = new Ajv();

type ValidationResult = {
    result: boolean;
    errorSchemaPath?: string;
    errorMessage?: string;
};
const validate = (
    requestPayloadItem: unknown,
    requestItemType: RequestItemType
): ValidationResult => {
    let validateFunc = null;
    switch (requestItemType) {
        case 'food':
            validateFunc = ajv.compile(foodSchema);
            break;
        case 'ingredient':
            validateFunc = ajv.compile(ingredientSchema);
            break;
        default:
            return { result: false };
    }

    if (Array.isArray(requestPayloadItem)) {
        for (let item of requestPayloadItem) {
            const result = validateFunc(item);
            if (!result) {
                let errors = validateFunc.errors;
                console.error({ errors });
                return {
                    result: false,
                    errorSchemaPath: errors![0].schemaPath,
                    errorMessage: errors![0].message,
                };
            }
        }
        return { result: true };
    } else {
        const result = validateFunc(requestPayloadItem);
        let errors = validateFunc.errors;
        return result
            ? { result: true }
            : {
                  result: false,
                  errorSchemaPath: errors![0].schemaPath,
                  errorMessage: errors![0].message,
              };
    }
};

export async function importItemHandler(event: APIGatewayProxyEventV2) {
    const userId = event.headers['User-Id'];

    if (!userId) {
        return {
            statusCode: 500,
            body: 'User Id is not defined.',
        };
    }

    if (!tableName || !partitionKey) {
        return {
            statusCode: 500,
            body: "The function doesn't have proper environment variables.",
        };
    }
    if (!event.body) {
        return {
            statusCode: 400,
            body: "Event doesn't have a body",
        };
    }

    const payload: RequestPayload = JSON.parse(event.body);

    if (!payload.payloadType || !payload.payloadBody) {
        return {
            statusCode: 500,
            body: 'Payload does not have payloadType or payloadBody.',
        };
    }

    let validationResult = validate(payload.payloadBody, payload.payloadType);
    if (!validationResult.result) {
        return {
            statusCode: 500,
            body: !validationResult.errorSchemaPath
                ? `Invalid type ${payload.payloadType}`
                : `Schema Path: ${validationResult.errorSchemaPath}. Error message: ${validationResult.errorMessage}.`,
        };
    }

    const requestItems = payload.payloadBody.map((item: Food) => {
        const { id, ...rest } = item;
        return {
            PutRequest: {
                Item: {
                    pk: `user#${userId}`,
                    sk: `${payload.payloadType}#${id}`,
                    type: `${payload.payloadType}`,
                    ...rest,
                },
            },
        };
    });

    let i,
        j,
        batch,
        batchSize = 24;
    for (i = 0, j = requestItems.length; i < j; i += batchSize) {
        batch = requestItems.slice(i, i + batchSize);
        // do whatever
        const params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput = {
            RequestItems: {
                [tableName!]: [...batch],
            },
        };

        try {
            const result = await dynClient.batchWrite(params).promise();
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify(e),
            };
        }
    }
}
