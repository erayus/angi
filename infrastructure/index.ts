#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";

import { HostingStack } from "./src/stacks/hosting-stack";
import { NameGenerator } from "./src/utils/name-generator";
import { DatabaseStack } from "./src/stacks/database-stack";
import { AuthenticationStack } from './src/stacks/authentication-stack';
import { CommandsStack } from "./src/stacks/commands-stack";

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const dbStack = new DatabaseStack(
  app,
  NameGenerator.generateConstructName(
    app,
    "database-stack",
  ),
  { env }
);

new HostingStack(
  app,
  NameGenerator.generateConstructName(
    app,
    "hosting-stack",
  ),
  { env }
);

new CommandsStack(
  app,
  NameGenerator.generateConstructName(
    app,
    "commands-stack",
  ),{ env }
).addDependency(dbStack);

new AuthenticationStack(
  app,
  NameGenerator.generateConstructName(
    app,
    "authentation-stack",
  ),
  { env }
)
