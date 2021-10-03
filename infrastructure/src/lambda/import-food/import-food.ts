import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as AWS from "aws-sdk";

const dynClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  endpoint: "http://localhost:4566",
});

const tableName = process.env.TABLE_NAME;
const partitionKey = process.env.PARTITION_KEY;

const partitionKeyExists = (partitionKeyName: string, input: unknown): boolean => {
  if (Array.isArray(input)) {
    for (let item of input) {
      const keys = Object.keys(item);
      let result = keys.includes(partitionKeyName);
      if (!result) {
        return false
      }
    }

    return true;
  } else {
    return false
  }
}
export async function importFood(event: APIGatewayProxyEventV2) {
  if (!tableName || !partitionKey) {
    return {
      statusCode: 500,
      body: "The function doesn't have proper environment variables.",
    };
  }
  if (!event.body) {
    return {
      statusCode: 500,
      body: "Event doesn't have a body",
    };
  }

  const input = JSON.parse(event.body);

  if (!Array.isArray(input)) {
    return {
      statusCode: 500,
      body: "Event body must be a list.",
    };
  }
  //TODO check if the each food in input has the right primary key.
  if (!partitionKeyExists(partitionKey, input)) {
    return {
      statusCode: 500,
      body: "One or more items don't have a partition key.",
    };
  }

  const requestItems = input.map((food) => {
    return {
      PutRequest: {
        Item: {
          ...food
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
 //TODO: export to a util layer


