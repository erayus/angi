import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as AWS from 'aws-sdk';

import { GenerateResponse } from '/opt/nodejs/constants';

const env = process.env.ENVIRONMENT;
const dynClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const tableName = process.env.TABLE_NAME;

export async function deleteItemHandler(event: APIGatewayProxyEventV2) {
    try {
        const userId = event.headers['user-id'];

        if (!userId) {
            throw new Error('User Id is not defined.');
        }

        if (!tableName || !env) {
            throw new Error(
                'The function is missing some environment variables.'
            );
        }

        if (!event.body) {
            throw new Error('Event does not have a body');
        }

        const payload = JSON.parse(event.body);

        if (!payload.itemType || !payload.itemIds) {
            throw new Error('Payload does not have itemType or itemIds.');
        }

        const deleteItems: AWS.DynamoDB.DocumentClient.DeleteItemInput[] =
            payload.itemIds.map((id: any) => {
                return {
                    TableName: tableName,
                    Key: {
                        pk: `${payload.itemType}#${id}`,
                        sk: `user#${userId}`,
                    },
                } as AWS.DynamoDB.DocumentClient.DeleteItemInput;
            });

        for (let i = 0; i < deleteItems.length; i += 1) {
            try {
                await dynClient.delete(deleteItems[i]).promise();
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
        return GenerateResponse(
            200,
            env,
            'POST',
            JSON.stringify('Delete Successfully')
        );
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
