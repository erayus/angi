import * as cdk from '@aws-cdk/core';
import * as aws_cloudfront from '@aws-cdk/aws-cloudfront';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

import { ConfigProvider } from '../utils/config-provider';
import { NameGenerator } from '../utils/name-generator';
import { ApiPath } from '../../../website/src/models/api-path';
import { tablePartitionKey } from '../stacks/database-stack';

export default class Commnads extends cdk.Construct {
    public readonly distribution: aws_cloudfront.CloudFrontWebDistribution;
    constructor(scope: cdk.Stack, id: string, props: cdk.StackProps) {
        super(scope, id);

        const tableName = cdk.Fn.importValue(
            NameGenerator.generateConstructName(scope, 'table-name')
        );
        const importedTable = dynamodb.Table.fromTableName(
            this,
            'Imported-Table',
            tableName
        );

        const schemasLayer = new lambda.LayerVersion(this, 'Schema-Layer', {
            compatibleRuntimes: [
                lambda.Runtime.NODEJS_12_X,
                lambda.Runtime.NODEJS_14_X,
            ],
            code: lambda.Code.fromAsset('src/layers/schemas'),
            description: 'Json Schemas for validating lambda input',
        });

        const sharedLayer = new lambda.LayerVersion(this, 'Shared-Layer', {
            compatibleRuntimes: [
                lambda.Runtime.NODEJS_12_X,
                lambda.Runtime.NODEJS_14_X,
            ],
            code: lambda.Code.fromAsset('src/layers/shared'),
            description: 'Shared files',
        });

        const getAllFoodFunc = new lambdaNode.NodejsFunction(
            this,
            'Get-All-Food-Function',
            {
                functionName: NameGenerator.generateConstructName(
                    scope,
                    'get-all-food-function'
                ),
                runtime: lambda.Runtime.NODEJS_12_X,
                // name of the exported function
                handler: 'getAllFoodHandler',
                // file to use as entry point for our Lambda function
                entry: './src/lambda/get-all-food/get-all-food.ts',
                environment: {
                    TABLE_NAME: importedTable.tableName,
                    ENVIRONMENT: ConfigProvider.Context(this).Environment,
                },
                bundling: {
                    minify: false,
                    externalModules: ['aws-sdk'],
                },
                layers: [schemasLayer, sharedLayer],
            }
        );
        importedTable.grantReadData(getAllFoodFunc);

        const importItemFunc = new lambdaNode.NodejsFunction(
            this,
            'Import-Item-Function',
            {
                functionName: NameGenerator.generateConstructName(
                    scope,
                    'import-item-function'
                ),
                runtime: lambda.Runtime.NODEJS_12_X,
                // name of the exported function
                handler: 'importItemHandler',
                // file to use as entry point for our Lambda function
                entry: __dirname + '/../lambda/import-item/import-item.ts',
                environment: {
                    TABLE_NAME: importedTable.tableName,
                    PARTITION_KEY: tablePartitionKey,
                },
                bundling: {
                    minify: false,
                    externalModules: ['aws-sdk'],
                },
                layers: [schemasLayer],
            }
        );
        importedTable.grantReadWriteData(importItemFunc);

        const api = new apigateway.RestApi(this, `Api`, {
            restApiName: NameGenerator.generateConstructName(
                scope,
                'api-service'
            ),
        });

        const importItemApi = api.root.addResource(ApiPath.IMPORT_ITEM);
        const importFoodIntegration = new apigateway.LambdaIntegration(
            importItemFunc
        );
        importItemApi.addMethod('POST', importFoodIntegration);
        addCorsOptions(importItemApi);

        const getAllFoodApi = api.root.addResource(ApiPath.GET_ALL_FOOD);
        const getAllFoodIntegration = new apigateway.LambdaIntegration(
            getAllFoodFunc
        );
        getAllFoodApi.addMethod('GET', getAllFoodIntegration);
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
        'OPTIONS',
        new apigateway.MockIntegration({
            integrationResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers':
                            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                        'method.response.header.Access-Control-Allow-Origin':
                            "'*'",
                        'method.response.header.Access-Control-Allow-Credentials':
                            "'false'",
                        'method.response.header.Access-Control-Allow-Methods':
                            "'OPTIONS,GET,PUT,POST,DELETE'",
                    },
                },
            ],
            passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
            requestTemplates: {
                'application/json': '{"statusCode": 200}',
            },
        }),
        {
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers':
                            true,
                        'method.response.header.Access-Control-Allow-Methods':
                            true,
                        'method.response.header.Access-Control-Allow-Credentials':
                            true,
                        'method.response.header.Access-Control-Allow-Origin':
                            true,
                    },
                },
            ],
        }
    );
}
