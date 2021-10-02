import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as AWS from "aws-sdk";

// AWS.config.update({region: 'ap-southeast-2'});

const dynClient = new AWS.DynamoDB.DocumentClient({
  endpoint: "http://localhost:4566",
});
const tableName = process.env.TABLE_NAME;
const primaryKey = process.env.PRIMARY_KEY;


export async function importFood(event: APIGatewayProxyEventV2) {
  if (!event.body) {
    return {
      statusCode: 400,
      body: "Event doesn't have a body",
    };
  }

  const input = JSON.parse(event.body);

  if (!Array.isArray(input)) {
    return {
      statusCode: 400,
      body: "Event body must be a list.",
    };
  }
  const requestItems = input.map((food) => {
    return {
      PutRequest: {
        Item: {
          foodId: food.foodId,
          foodName: food.foodName,
        },
      },
    };
  });

  const params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput = {
    RequestItems: {
      tableName: [...requestItems],
    },
  };

  try {
    const result = dynClient.batchWrite(params).promise();
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
