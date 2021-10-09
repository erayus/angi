import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

import { ConfigProvider } from "../utils/config-provider";
import { NameGenerator } from "../utils/name-generator";

export const foodTablePartitionKey = "food_id";

export class DatabaseStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const appName = ConfigProvider.Context(scope).AppName;
    const isDevelopment = ConfigProvider.Context(scope).IsDevelopment;

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
      billingMode: isDevelopment ?
        dynamodb.BillingMode.PROVISIONED :
        dynamodb.BillingMode.PAY_PER_REQUEST,
      readCapacity: isDevelopment ? 1 : undefined,
      writeCapacity: isDevelopment ? 1 : undefined,
      removalPolicy: isDevelopment
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, `Output-FoodTableName`, {
      exportName: NameGenerator.generateConstructName(
        scope,
        "food-table-name",
        isDevelopment
      ),
      value: foodTable.tableName,
    });
  }
}
