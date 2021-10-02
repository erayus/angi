import * as cdk from "@aws-cdk/core";
import * as aws_s3 from "@aws-cdk/aws-s3";

import CloudfrontDistribution from "../constructs/CloudFrontDistribution";
import Route53ARecord from "../constructs/Route53ARecord";
import { RemovalPolicy } from "@aws-cdk/core";
import * as aws_s3_deployment from "@aws-cdk/aws-s3-deployment";
import { HttpMethods } from "@aws-cdk/aws-s3";
import Commnads from '../constructs/Commands';
import { ConfigProvider } from '../utils/config-provider';

export class HostingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const appName = ConfigProvider.Context(scope).AppName;
    const isDevelopment = ConfigProvider.Context(scope).IsDevelopment;

    const webBucket = new aws_s3.Bucket(
      this,
      `Website-Bucket`,
      {
        bucketName: `${appName}.erayus.com`,
        websiteIndexDocument: "index.html",
        websiteErrorDocument: "index.html",
        publicReadAccess: true,
        autoDeleteObjects:  isDevelopment? true : false,
        removalPolicy: isDevelopment? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
      }
    );

    let cloudfrontDistribution;
    if (!isDevelopment) {
      cloudfrontDistribution = new CloudfrontDistribution(
        this,
        `${appName}-cloudfront-distribution`,
        { bucket: webBucket }
      );

      new Route53ARecord(
        this,
        `${appName}-route53-ARecord`,
        { distribution: cloudfrontDistribution.distribution }
      ).node.addDependency(webBucket, cloudfrontDistribution);

      new aws_s3_deployment.BucketDeployment(
        this,
        `Web-Bucket-Deploymnet`,
        {
          sources: [aws_s3_deployment.Source.asset("../website/build")],
          destinationBucket: webBucket,
          distribution: cloudfrontDistribution.distribution || undefined,
          distributionPaths: ["/index.html"],
        }
      ).node.addDependency(webBucket, cloudfrontDistribution);

      const imgBucket = new aws_s3.Bucket(
        this,
        `Images-Bucket`,
        {
          bucketName: `${appName}-erayus-images`,
          publicReadAccess: true,
          cors: [
            {
              allowedMethods: [HttpMethods.GET],
              allowedOrigins: ["localhost:3000", "smartmenu.erayus.com"],
            },
          ],
          autoDeleteObjects: isDevelopment ? true : false,
          removalPolicy: isDevelopment ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
        }
      );

      new aws_s3_deployment.BucketDeployment(
        this,
        `Food-Images-Bucket-Deploymnet`,
        {
          sources: [aws_s3_deployment.Source.asset("../shared/food-images")],
          destinationBucket: imgBucket,
        }
      );
    }

    new Commnads(this,`${appName}-Commands`, props);

    new cdk.CfnOutput(
      this,
      `Output-bucketName`,
      {
        exportName: `${appName}-bucket-name`,
        value: webBucket.bucketName,
      }
    );

    new cdk.CfnOutput(
      this,
      `Output-BucketDomainName`,
      {
        exportName: `${appName}-bucket-domain-name`,
        value: `https://${webBucket.bucketDomainName}`,
      }
    );
  }
}
