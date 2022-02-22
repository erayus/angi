import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

import { ConfigProvider } from '../utils/config-provider';
import { NameGenerator } from '../utils/name-generator';

export const tablePartitionKey = 'pk';
export const tableSortKey = 'sk';

export class DatabaseStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);
        const isDevelopment = ConfigProvider.Context(scope).IsDevelopment;

        const table = new dynamodb.Table(this, 'Table', {
            partitionKey: {
                name: tablePartitionKey,
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: tableSortKey,
                type: dynamodb.AttributeType.STRING,
            },
            tableName: NameGenerator.generateConstructName(scope, `table`),
            billingMode: isDevelopment
                ? dynamodb.BillingMode.PROVISIONED
                : dynamodb.BillingMode.PAY_PER_REQUEST,
            readCapacity: isDevelopment ? 1 : undefined,
            writeCapacity: isDevelopment ? 1 : undefined,
            removalPolicy: isDevelopment
                ? cdk.RemovalPolicy.DESTROY
                : cdk.RemovalPolicy.RETAIN,
        });

        new cdk.CfnOutput(this, `Output-FoodTableName`, {
            exportName: NameGenerator.generateConstructName(
                scope,
                'table-name'
            ),
            value: table.tableName,
        });
    }
}
