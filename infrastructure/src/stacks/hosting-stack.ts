import * as cdk from "@aws-cdk/core";
import * as aws_s3 from "@aws-cdk/aws-s3";

import CloudfrontDistribution from "../constructs/CloudFrontDistribution";
import Route53ARecord from "../constructs/Route53ARecord";
import { RemovalPolicy } from "@aws-cdk/core";
import * as aws_s3_deployment from "@aws-cdk/aws-s3-deployment";
import { HttpMethods } from "@aws-cdk/aws-s3";
import Commnads from "../constructs/Commands";
import { ConfigProvider } from "../utils/config-provider";
import { NameGenerator } from '../utils/name-generator';

export class HostingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const appName = ConfigProvider.Context(scope).AppName;
    const isDevelopment = ConfigProvider.Context(scope).IsDevelopment;

    new Commnads(this, `${appName}-Commands`, props);

    const imgBucket = new aws_s3.Bucket(this, NameGenerator.generateConstructName(scope, 'Images-Bucket', isDevelopment), {
      bucketName: NameGenerator.generateConstructName(scope, 'erayus-images', isDevelopment),
      publicReadAccess: true,
      cors: [
        {
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ["localhost:3000", "smartmenu.erayus.com"],
        },
      ],
      autoDeleteObjects: isDevelopment ? true : false,
      removalPolicy: isDevelopment
        ? RemovalPolicy.DESTROY
        : RemovalPolicy.RETAIN,
    });

    new aws_s3_deployment.BucketDeployment(
      this,
      NameGenerator.generateConstructName(scope, 'Food-Images-Bucket-Deployment', isDevelopment),
      {
        sources: [aws_s3_deployment.Source.asset("../shared/food-images")],
        destinationBucket: imgBucket,
      }
    );

    if (!isDevelopment) {
      let cloudfrontDistribution;
      const webBucket = new aws_s3.Bucket(this, NameGenerator.generateConstructName(scope, 'Website-Bucket', isDevelopment ), {
        bucketName: `${appName}.erayus.com`,
        websiteIndexDocument: "index.html",
        websiteErrorDocument: "index.html",
        publicReadAccess: true,
        autoDeleteObjects: isDevelopment ? true : false,
        removalPolicy: isDevelopment
          ? RemovalPolicy.DESTROY
          : RemovalPolicy.RETAIN,
      });
      cloudfrontDistribution = new CloudfrontDistribution(
        this,
        `Cloudfront-Distribution`,
        { bucket: webBucket }
      );

      new Route53ARecord(this, NameGenerator.generateConstructName(scope, 'Route53-ARecord', isDevelopment), {
        distribution: cloudfrontDistribution.distribution,
      }).node.addDependency(webBucket, cloudfrontDistribution);

      new aws_s3_deployment.BucketDeployment(this, NameGenerator.generateConstructName(scope, 'Web-Bucket-Deployment', isDevelopment), {
        sources: [aws_s3_deployment.Source.asset("../website/build")],
        destinationBucket: webBucket,
        distribution: cloudfrontDistribution.distribution || undefined,
        distributionPaths: ["/index.html"],
      }).node.addDependency(webBucket, cloudfrontDistribution);

      new cdk.CfnOutput(this, `Output-bucketName`, {
        exportName: NameGenerator.generateConstructName(
          scope,
          "bucket-name-output",
          isDevelopment
        ),
        value: webBucket.bucketName,
      });

      new cdk.CfnOutput(this, `Output-BucketDomainName`, {
        exportName: NameGenerator.generateConstructName(
          scope,
          "bucket-domain-name-ouput",
          isDevelopment
        ),
        value: `https://${webBucket.bucketDomainName}`,
      });
    }
  }
}
