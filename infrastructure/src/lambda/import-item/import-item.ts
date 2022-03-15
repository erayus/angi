import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import Ajv from 'ajv';
import * as foodSchema from '/opt/nodejs/foodSchema.json';
import * as ingredientSchema from '/opt/nodejs/ingredientSchema.json';
import { Food } from '../../../../website/src/models/Food';
import { GenerateResponse } from '/opt/nodejs/constants';
import { AddItemRequestItemType } from '../../../../website/src/models/RequestPayload';

const env = process.env.ENVIRONMENT;
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
    requestPayloadItem: any[],
    requestItemType: AddItemRequestItemType
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
};

export async function importItemHandler(event: APIGatewayProxyEventV2) {
    try {
        const userId = event.headers['user-id'];

        if (!userId) {
            throw new Error('User Id is not defined.');
        }

        if (!tableName || !partitionKey || !env) {
            throw new Error(
                'The function is missing some environment variables.'
            );
        }

        if (!event.body) {
            throw new Error('Event does not have a body');
        }

        const payload = JSON.parse(event.body);

        if (!payload.payloadType || !payload.payloadBody) {
            throw new Error(
                'Payload does not have payloadType or payloadBody.'
            );
        }

        let validationResult = validate(
            payload.payloadBody,
            payload.payloadType
        );
        if (!validationResult.result) {
            const errorMessage = !validationResult.errorSchemaPath
                ? `Invalid type ${payload.payloadType}`
                : `Schema Path: ${validationResult.errorSchemaPath}. Error message: ${validationResult.errorMessage}.`;

            throw new Error(errorMessage);
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
                return GenerateResponse(
                    200,
                    env,
                    'POST',
                    JSON.stringify(result)
                );
            } catch (e) {
                console.error(e);
                return GenerateResponse(
                    500,
                    env!,
                    'POST',
                    (e as Error).message
                );
            }
        }
    } catch (e) {
        console.error(e);
        const body =
            typeof e == 'object'
                ? (e as Error).message
                : typeof e == 'string'
                ? e
                : 'Unkown error, please check Cloudwatch logs';
        return GenerateResponse(400, env!, 'POST', body);
    }
}
