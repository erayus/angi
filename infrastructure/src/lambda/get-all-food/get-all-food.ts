import { Food } from './../../../../website/src/models/Food';
import * as AWS from 'aws-sdk';
import { Environment } from '/opt/nodejs/constants';

const dynClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: 'ap-southeast-2',
});

const tableName = process.env.TABLE_NAME;
const env = process.env.ENVIRONMENT;

export async function getAllFoodHandler() {
    if (!tableName) {
        return {
            statusCode: 500,
            body: "The function doesn't have proper environment variables.",
        };
    }

    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: tableName,
    };

    try {
        const scanResults: any = [];
        let items;
        do {
            items = await dynClient.scan(params).promise();
            items.Items?.forEach((item: any) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        } while (typeof items.LastEvaluatedKey !== 'undefined');

        console.log(scanResults);

        const menuFood: Food[] = scanResults.map((item: any) => {
            return {
                foodId: item.sk.split('#')[1], //sk: food#1
                foodName: item.foodName,
                foodCategory: item.foodCategory,
                imgUrl: item.imgUrl,
                foodIngredients: item.foodIngredients,
                isPublic: item.isPublic,
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
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                // "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: JSON.stringify(menuFood),
        };
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify(e),
        };
    }
}
