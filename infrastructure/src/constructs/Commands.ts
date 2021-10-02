import * as cdk from "@aws-cdk/core";
import * as aws_cloudfront from "@aws-cdk/aws-cloudfront";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaNode from "@aws-cdk/aws-lambda-nodejs";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export default class Commnads extends cdk.Construct {
  public readonly distribution: aws_cloudfront.CloudFrontWebDistribution;

  constructor(scope: cdk.Stack, id: string, props: cdk.StackProps) {
    super(scope, id);
    const appName = this.node.tryGetContext('appName') ?? "defaultAppName";


    const dynamoTable = new dynamodb.Table(this, "foodTable", {
      partitionKey: {
        name: "foodId",
        type: dynamodb.AttributeType.STRING,
      },
      tableName: `${appName}-food-table`,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
      // the new table, and it will remain in your account until manually deleted. By setting the policy to
      // DESTROY, cdk destroy will delete the table (even if it has data in it)
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
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

    const importFoodFunc = new lambdaNode.NodejsFunction(this, 'PostFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      // name of the exported function
      handler: 'importFood',
      // file to use as entry point for our Lambda function
      entry: __dirname + '/../lambda/import-food/import-food.ts',
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'foodId'
      },
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
      
      const api = new apigateway.RestApi(this,  `${appName}-api`, {
        restApiName: `${appName}-service`,
      });
      const importFoodApi = api.root.addResource('import-food');
      // onst getAllIntegration = new apigateway.LambdaIntegration(getAllLambda);
      // cars.addMethod('GET', getAllIntegration);
      
      const importFoodIntegration = new apigateway.LambdaIntegration(importFoodFunc);
      importFoodApi.addMethod('POST', importFoodIntegration);
      addCorsOptions(importFoodApi);
      
      new cdk.CfnOutput(
        scope,
        `output-importFood-api-endpoint`,
        {
          exportName: `${this.node.tryGetContext("appName")}-importFood-api-endpoint`,
          value: `http://localhost:4566/restapis/${api.restApiId}/prod/_user_request_${importFoodApi.path}`,
        }
      );
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