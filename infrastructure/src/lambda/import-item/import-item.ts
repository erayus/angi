import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import Ajv from 'ajv';
import * as foodSchema from '/opt/nodejs/foodSchema.json';
import { Food } from '../../../../website/src/models/Food';
import {
    RequestItemType,
    RequestPayload,
} from '../../../../website/src/models/RequestPayload';

const dynClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const tableName = process.env.TABLE_NAME;
const partitionKey = process.env.PARTITION_KEY;
const ajv = new Ajv();

const validate = (
    requestPayloadItem: unknown,
    requestItemType: RequestItemType
): boolean => {
    let validateFunc = null;
    switch (requestItemType) {
        case 'food':
            validateFunc = ajv.compile(foodSchema);
            break;
        default:
            return false;
    }

    if (Array.isArray(requestPayloadItem)) {
        for (let item of requestPayloadItem) {
            const result = validateFunc(item);
            if (!result) {
                return false;
            }
        }
        return true;
    } else {
        const result = validateFunc(requestPayloadItem);
        return result ? true : false;
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

    if (!validate(payload.payloadBody, payload.payloadType)) {
        return {
            statusCode: 500,
            body: `One or more items don't match ${payload.payloadType} schema.`,
        };
    }

    const requestItems = payload.payloadBody.map((item: Food) => {
        const { id, ...rest } = item;
        return {
            PutRequest: {
                Item: {
                    pk: `${payload.payloadType}#${userId}`,
                    sk: `${payload.payloadType}#${id}`,
                    ...rest,
                },
            },
        };
    });

    const params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput = {
        RequestItems: {
            [tableName!]: [...requestItems],
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
