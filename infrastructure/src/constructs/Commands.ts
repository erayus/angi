import * as cdk from "@aws-cdk/core";
import * as aws_cloudfront from "@aws-cdk/aws-cloudfront";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaNode from "@aws-cdk/aws-lambda-nodejs";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { ConfigProvider } from "../utils/config-provider";
import { NameGenerator } from "../utils/name-generator";
import { ApiPath } from "../../../shared/models/api-path";

export default class Commnads extends cdk.Construct {
  public readonly distribution: aws_cloudfront.CloudFrontWebDistribution;

  constructor(scope: cdk.Stack, id: string, props: cdk.StackProps) {
    super(scope, id);
    const isDevelopment: boolean = ConfigProvider.Context(scope).IsDevelopment;

    const foodTablePartitionKey = "food_id";
    const foodTable = new dynamodb.Table(this, "Food-Table", {
      partitionKey: {
        name: foodTablePartitionKey,
        type: dynamodb.AttributeType.NUMBER,
      },
      tableName: NameGenerator.generateConstructName(
        scope,
        "food-table",
        isDevelopment
      ),
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: isDevelopment
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
    });

    const schemasLayer = new lambda.LayerVersion(this, "Schema-Layer", {
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_12_X,
        lambda.Runtime.NODEJS_14_X,
      ],
      code: lambda.Code.fromAsset("src/layers/schemas"),
      description: "Json Schemas for validating lambda input",
    });

    const getAllFoodFunc = new lambdaNode.NodejsFunction(
      this,
      "Get-All-Food-Function",
      {
        functionName: NameGenerator.generateConstructName(
          scope,
          "get-all-food-function",
          isDevelopment
        ),
        runtime: lambda.Runtime.NODEJS_12_X,
        // name of the exported function
        handler: "getAllFoodHandler",
        // file to use as entry point for our Lambda function
        entry: __dirname + "/../lambda/get-all-food/get-all-food.ts",
        environment: {
          TABLE_NAME: foodTable.tableName,
          PARTITION_KEY: foodTablePartitionKey,
        },
        bundling: {
          minify: false,
          externalModules: [], //TODO: excluding aws-cdk in Production
        },
        layers: [schemasLayer],
      }
    );
    foodTable.grantReadData(getAllFoodFunc);

    const importFoodFunc = new lambdaNode.NodejsFunction(
      this,
      "Import-Food-Function",
      {
        functionName: NameGenerator.generateConstructName(
          scope,
          "import-food-function",
          isDevelopment
        ),
        runtime: lambda.Runtime.NODEJS_12_X,
        // name of the exported function
        handler: "importFoodHandler",
        // file to use as entry point for our Lambda function
        entry: __dirname + "/../lambda/import-food/import-food.ts",
        environment: {
          TABLE_NAME: foodTable.tableName,
          PARTITION_KEY: foodTablePartitionKey,
        },
        bundling: {
          minify: false,
          externalModules: [], //TODO: excluding aws-cdk in Production
        },
        layers: [schemasLayer],
      }
    );
    foodTable.grantReadWriteData(importFoodFunc);

    const api = new apigateway.RestApi(this, `Api`, {
      restApiName: NameGenerator.generateConstructName(
        scope,
        "api-service",
        isDevelopment
      ),
    });
    
    const importFoodApi = api.root.addResource(ApiPath.IMPORT_FOOD);
    const importFoodIntegration = new apigateway.LambdaIntegration(
      importFoodFunc
    );
    importFoodApi.addMethod("POST", importFoodIntegration);
    addCorsOptions(importFoodApi);

    const getAllFoodApi = api.root.addResource(ApiPath.GET_ALL_FOOD);
    const getAllFoodIntegration = new apigateway.LambdaIntegration(
      getAllFoodFunc
    );
    getAllFoodApi.addMethod("GET", getAllFoodIntegration);
    addCorsOptions(getAllFoodApi);

    // const singleItem = cars.addResource('{id}');
    // const getOneIntegration = new apigateway.LambdaIntegration(getOneLambda);
    // singleItem.addMethod('GET', getOneIntegration);

    // const updateOneIntegration = new apigateway.LambdaIntegration(updateOne);
    // singleItem.addMethod('PATCH', updateOneIntegration);

    // const deleteOneIntegration = new apigateway.LambdaIntegration(deleteOne);
    // singleItem.addMethod('DELETE', deleteOneIntegration);
    // addCorsOptions(singleItem);
  }
}
export function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
