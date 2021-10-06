import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import * as AWS from "aws-sdk";
import Ajv from "ajv";
/* eslint-disable import/extensions, import/no-absolute-path */
import * as foodSchema from "/opt/nodejs/foodSchema.json";
import { ServiceConfigurationOptions } from "aws-sdk/lib/service";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { ClientApiVersions } from "aws-sdk/clients/dynamodb";

const dynClient = new AWS.DynamoDB.DocumentClient(  { apiVersion: '2012-08-10' });

const tableName = process.env.TABLE_NAME;
const partitionKey = process.env.PARTITION_KEY;
const ajv = new Ajv();
const validate_food = ajv.compile(foodSchema)

const validateInput = (input: unknown): boolean => {
  if (Array.isArray(input)) {
    for (let item of input) {
      const result = validate_food(item);
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

  if (!validateInput(input)) {
    return {
      statusCode: 500,
      body: "One or more items don't match the food schema.",
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
