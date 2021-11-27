import * as cdk from "@aws-cdk/core";

import Commnads from "../constructs/Commands";
import { ConfigProvider } from "../utils/config-provider";

export class CommandsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const appName = ConfigProvider.Context(scope).AppName;

    new Commnads(this, `${appName}-Commands`, props);
  }
}
