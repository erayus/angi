import * as AWS from "aws-sdk";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const dynClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: 'ap-southeast-2' });

const tableName = process.env.TABLE_NAME;

export async function getAllFoodHandler(event: APIGatewayProxyEventV2) {
  if (!tableName) {
    return {
      statusCode: 500,
      body: "The function doesn't have proper environment variables.",
    };
  }

  const params : AWS.DynamoDB.DocumentClient.ScanInput = {
    TableName: tableName,
  };

  try {
    const scanResults : any  = [];
    let items;
    do {
      items =  await dynClient.scan(params).promise();
      items.Items?.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey  = items.LastEvaluatedKey;
    } while(typeof items.LastEvaluatedKey !== "undefined");

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "application/json",
        "Access-Control-Allow-Origin" : "http://localhost:3000", // Required for CORS support to work,
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        // "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(scanResults),
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify(e),
    };
  }
}
