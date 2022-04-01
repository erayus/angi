import { Food } from '../../../../website/src/models/Food';
import * as AWS from 'aws-sdk';
import { Environment } from '/opt/nodejs/constants';
import { APIGatewayProxyEventV2 } from 'aws-lambda/trigger/api-gateway-proxy';

const dynClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: 'ap-southeast-2',
});

const tableName = process.env.TABLE_NAME;
const env = process.env.ENVIRONMENT;

export async function getItemsByUserIdItemTypeHandler(
    event: APIGatewayProxyEventV2
) {
    if (!tableName) {
        return {
            statusCode: 500,
            body: "The function doesn't have proper environment variables.",
        };
    }

    const itemType = event.queryStringParameters
        ? event.queryStringParameters['type']
        : null;

    if (!itemType) {
        return { statusCode: 400, body: 'Missing type in query parameters' };
    }

    const userId = 1; // TODO: get from headers
    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
        TableName: tableName,
        IndexName: 'userItemTypeIndex', //TODO: get this from environment variable
        KeyConditionExpression:
            '#hashKey = :hashKey and begins_with(#type, :type)',
        ExpressionAttributeNames: {
            '#hashKey': 'sk',
            '#type': 'type',
        },
        ExpressionAttributeValues: {
            ':hashKey': `user#${userId}`,
            ':type': `${itemType}`,
        },
        ScanIndexForward: true,
    };

    try {
        const queryResult: any = [];
        let items;
        do {
            items = await dynClient.query(params).promise();
            items.Items?.forEach((item: any) => queryResult.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== 'undefined');

        const itemsResult: any[] = queryResult.map((item: any) => {
            const { pk, sk, type, ...itemBody } = item;
            return {
                id: pk.split('#')[1], //sk: food#1
                ...itemBody,
            };
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': 'application/json',
                'Access-Control-Allow-Origin':
                    env === Environment.DEV
                        ? 'http://localhost:3000'
                        : 'https://smartmenu.erayus.com', // Required for CORS support to work,
                'Access-Control-Allow-Methods': 'OPTIONS,GET',
                // "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: JSON.stringify(itemsResult),
        };
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        };
    }
}
