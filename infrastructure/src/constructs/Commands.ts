import * as cdk from "@aws-cdk/core";
import * as aws_cloudfront from "@aws-cdk/aws-cloudfront";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaNode from "@aws-cdk/aws-lambda-nodejs";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { ConfigProvider } from '../utils/config-provider';


export default class Commnads extends cdk.Construct {
  public readonly distribution: aws_cloudfront.CloudFrontWebDistribution;

  constructor(scope: cdk.Stack, id: string, props: cdk.StackProps) {
    super(scope, id);
    const appName: string = ConfigProvider.Context(scope).AppName;
    const isDevelopment: boolean = ConfigProvider.Context(scope).IsDevelopment;

    const primaryKey = "foodId";
    const dynamoTable = new dynamodb.Table(this, "foodTable", {
      partitionKey: {
        name: primaryKey,
        type: dynamodb.AttributeType.STRING,
      },
      tableName: `${appName}-food-table`,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: isDevelopment ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN, 
    });

    // const getOneLambda = new lambda.Function(this, 'getOneItemFunction', {
    //     code: new lambda.AssetCode('src/lambda/dist'),
    //     handler: 'get-one.handler',
    //     runtime: lambda.Runtime.NODEJS_10_X,
    //     environment: {
    //       TABLE_NAME: dynamoTable.tableName,
    //       PRIMARY_KEY: 'carId'
    //     }
    //   });
      
    //   const getAllLambda = new lambda.Function(this, 'getAllItemsFunction', {
    //     code: new lambda.AssetCode('src/lambda/dist'),
    //     handler: 'get-all.handler',
    //     runtime: lambda.Runtime.NODEJS_10_X,
    //     environment: {
    //       TABLE_NAME: dynamoTable.tableName,
    //       PRIMARY_KEY: 'carId'
    //     }
    //   });
  
    // const importFoodFunc = new lambda.Function(this, 'importFoodFunction', {
    //   code: new lambda.AssetCode('src/lambda'),
    //   handler: 'import-food.handler',
    //   runtime: lambda.Runtime.PYTHON_3_7,
    //   environment: {
    //     TABLE_NAME: dynamoTable.tableName,
    //     PRIMARY_KEY: 'foodId'
    //   }
    // });

    const importFoodFunc = new lambdaNode.NodejsFunction(this, 'ImportFoodFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      // name of the exported function
      handler: 'importFood',
      // file to use as entry point for our Lambda function
      entry: __dirname + '/../lambda/import-food/import-food.ts',
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: primaryKey
      },
      bundling: {
        minify: true,
        externalModules: [],
      }
    });

    // const updateOne = new lambda.Function(this, 'updateItemFunction', {
    //   code: new lambda.AssetCode('src'),
    //   handler: 'update-one.handler',
    //   runtime: lambda.Runtime.NODEJS_10_X,
    //   environment: {
    //     TABLE_NAME: dynamoTable.tableName,
    //     PRIMARY_KEY: 'carId'
    //   }
    // });

    // const deleteOne = new lambda.Function(this, 'deleteItemFunction', {
    //   code: new lambda.AssetCode('src'),
    //   handler: 'delete-one.handler',
    //   runtime: lambda.Runtime.NODEJS_10_X,
    //   environment: {
    //     TABLE_NAME: dynamoTable.tableName,
    //     PRIMARY_KEY: 'itemId'
    //   }
    // });
    
      dynamoTable.grantReadWriteData(importFoodFunc);
      // dynamoTable.grantReadWriteData(getOneLambda);
      // dynamoTable.grantReadWriteData(getAllLambda);
      
      const api = new apigateway.RestApi(this,  `${appName}-Api`, {
        restApiName: `${appName}-service`,
      });
      const importFoodApi = api.root.addResource('import-food');
      // onst getAllIntegration = new apigateway.LambdaIntegration(getAllLambda);
      // cars.addMethod('GET', getAllIntegration);
      
      const importFoodIntegration = new apigateway.LambdaIntegration(importFoodFunc);
      importFoodApi.addMethod('POST', importFoodIntegration);
      addCorsOptions(importFoodApi);
      
      if (ConfigProvider.Context(this).IsDevelopment) {
        new cdk.CfnOutput(
          scope,
          `Output-ImportFood-Api-Endpoint`,
          {
            exportName: `${this.node.tryGetContext("appName")}-importFood-api-endpoint`,
            value: `http://localhost:4566/restapis/${api.restApiId}/prod/_user_request_${importFoodApi.path}`,
          }
        );
      }
     
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
  apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },  
    }]
  });
}