#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';

import { HostingStack } from './src/stacks/hosting-stack';
import { NameGenerator } from './src/utils/name-generator';
import { ConfigProvider } from './src/utils/config-provider';

const app = new cdk.App();
const env ={ account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

new HostingStack(
  app, 
  NameGenerator.generateConstructName(app, 'stack', ConfigProvider.Context(app).IsDevelopment), 
  {env}
);