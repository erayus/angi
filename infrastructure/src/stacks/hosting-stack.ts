import * as cdk from "@aws-cdk/core";
import * as aws_s3 from "@aws-cdk/aws-s3";

import CloudfrontDistribution from "../constructs/CloudFrontDistribution";
import Route53ARecord from "../constructs/Route53ARecord";
import { RemovalPolicy } from "@aws-cdk/core";
import * as aws_s3_deployment from "@aws-cdk/aws-s3-deployment";
import { HttpMethods } from "@aws-cdk/aws-s3";
import Commnads from '../constructs/Commands';
import { ConfigProvider } from "../utils/config-provider";

export class HostingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const webBucket = new aws_s3.Bucket(
      this,
      `${this.node.tryGetContext("appName")}-bucket`,
      {
        bucketName: `${this.node.tryGetContext("appName")}.erayus.com`,
        websiteIndexDocument: "index.html",
        websiteErrorDocument: "index.html",
        publicReadAccess: true,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
      }
    );

    let cloudfrontDistribution;
    if (ConfigProvider.Context(scope).IsProduction) {
      cloudfrontDistribution = new CloudfrontDistribution(
        this,
        `${scope.node.tryGetContext("appName")}-cloudfront-distribution`,
        { bucket: webBucket }
      );

      new Route53ARecord(
        this,
        `${scope.node.tryGetContext("appName")}-route53-ARecord`,
        { distribution: cloudfrontDistribution.distribution }
      ).node.addDependency(webBucket, cloudfrontDistribution);

      new aws_s3_deployment.BucketDeployment(
        this,
        `${this.node.tryGetContext("appName")}-web-bucket-deploymnet`,
        {
          sources: [aws_s3_deployment.Source.asset("../website/build")],
          destinationBucket: webBucket,
          distribution: cloudfrontDistribution.distribution || undefined,
          distributionPaths: ["/index.html"],
        }
      );

      const imgBucket = new aws_s3.Bucket(
        this,
        `${this.node.tryGetContext("appName")}-erayus-images-bucket`,
        {
          bucketName: `${this.node.tryGetContext("appName")}-erayus-images`,
          publicReadAccess: true,
          cors: [
            {
              allowedMethods: [HttpMethods.GET],
              allowedOrigins: ["localhost:3000", "smartmenu.erayus.com"],
            },
          ],
          autoDeleteObjects: true,
          removalPolicy: RemovalPolicy.DESTROY,
        }
      );

      new aws_s3_deployment.BucketDeployment(
        this,
        `${this.node.tryGetContext("appName")}-food-images-bucket-deploymnet`,
        {
          sources: [aws_s3_deployment.Source.asset("../shared/food-images")],
          destinationBucket: imgBucket,
        }
      );
    }

    new Commnads(this,`${this.node.tryGetContext("appName")}-Commands`, props);

    new cdk.CfnOutput(
      this,
      `${this.node.tryGetContext("appName")}-output-bucketName`,
      {
        exportName: `${scope.node.tryGetContext("appName")}-bucket-name`,
        value: webBucket.bucketName,
      }
    );

    new cdk.CfnOutput(
      this,
      `${this.node.tryGetContext("appName")}-output-bucketDomainName`,
      {
        exportName: `${this.node.tryGetContext("appName")}-bucket-domain-name`,
        value: `https://${webBucket.bucketDomainName}`,
      }
    );
  }
}
