import * as cdk from '@aws-cdk/core';
import * as aws_cloudfront from '@aws-cdk/aws-cloudfront';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';

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

        const getItemsByUserIdItemTypeFunc = new lambdaNode.NodejsFunction(
            this,
            'Get-Items-By-UserId-ItemType-Function',
            {
                functionName: NameGenerator.generateConstructName(
                    scope,
                    'get-items-by-userId-itemType-function'
                ),
                runtime: lambda.Runtime.NODEJS_12_X,
                // name of the exported function
                handler: 'getItemsByUserIdItemTypeHandler',
                // file to use as entry point for our Lambda function
                entry: './src/lambda/get-items-by-userId-itemType/get-items-by-userId-itemType.ts',
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
        importedTable.grantReadData(getItemsByUserIdItemTypeFunc);

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
                    ENVIRONMENT: ConfigProvider.Context(this).Environment,
                },
                bundling: {
                    minify: false,
                    externalModules: ['aws-sdk'],
                },
                layers: [schemasLayer],
            }
        );
        importedTable.grantReadWriteData(importItemFunc);

        let imgBucketName = cdk.Fn.importValue(
            NameGenerator.generateConstructName(
                scope,
                'image-bucket-name-output'
            )
        );
        const getPresignedUrlFunc = new lambdaNode.NodejsFunction(
            this,
            'Get-Presigned-Url-Function',
            {
                functionName: NameGenerator.generateConstructName(
                    scope,
                    'get-presigned-url-function'
                ),
                runtime: lambda.Runtime.NODEJS_12_X,
                // name of the exported function
                handler: 'getPresignedUrlHandler',
                // file to use as entry point for our Lambda function
                entry:
                    __dirname +
                    '/../lambda/get-presigned-url/get-presigned-url.ts',
                environment: {
                    S3_BUCKET_NAME: imgBucketName,
                    ENVIRONMENT: ConfigProvider.Context(this).Environment,
                },
                bundling: {
                    minify: false,
                    externalModules: ['aws-sdk'],
                },
                layers: [sharedLayer],
            }
        );

        let importedImageBucket = s3.Bucket.fromBucketName(
            scope,
            'Imported-Img-Bucket-Name',
            imgBucketName
        );
        let lambdaS3PolicyStatement = new iam.PolicyStatement();
        lambdaS3PolicyStatement.addActions('s3:PutObject', 's3:GetObject');
        lambdaS3PolicyStatement.addResources(
            importedImageBucket.bucketArn + '/*'
        );
        getPresignedUrlFunc.addToRolePolicy(lambdaS3PolicyStatement);

        const api = new apigateway.RestApi(this, `Api`, {
            restApiName: NameGenerator.generateConstructName(
                scope,
                'api-service'
            ),
        });

        const importItemApiEndpoint = api.root.addResource(ApiPath.IMPORT_ITEM);
        const importFoodIntegration = new apigateway.LambdaIntegration(
            importItemFunc
        );
        importItemApiEndpoint.addMethod('POST', importFoodIntegration);
        addCorsOptions(importItemApiEndpoint);

        const getItemsByUserIdAndItemTypeApiEndpoint = api.root.addResource(
            ApiPath.GET_ITEMS_BY_USERID_ITEMTYPE
        );
        const getItemsByUserIdAndItemTypeIntegration =
            new apigateway.LambdaIntegration(getItemsByUserIdItemTypeFunc);
        getItemsByUserIdAndItemTypeApiEndpoint.addMethod(
            'GET',
            getItemsByUserIdAndItemTypeIntegration
        );
        addCorsOptions(getItemsByUserIdAndItemTypeApiEndpoint);

        const getPresignedUrlApiEndpoint = api.root.addResource(
            ApiPath.GET_PRESIGNED_URL
        );
        const getPresignedUrlntegration = new apigateway.LambdaIntegration(
            getPresignedUrlFunc
        );
        getPresignedUrlApiEndpoint.addMethod('GET', getPresignedUrlntegration);
        addCorsOptions(getPresignedUrlApiEndpoint);

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
                            "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,User-Id'",
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
