#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';

import { HostingStack } from './src/stacks/hosting-stack';

const app = new cdk.App();
const env ={ account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

new HostingStack(app, `${app.node.tryGetContext('appName')}-stack`, {env});