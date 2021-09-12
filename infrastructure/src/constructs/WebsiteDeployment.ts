import * as cdk from '@aws-cdk/core';
import * as aws_s3 from '@aws-cdk/aws-s3';
import * as aws_s3_deployment from '@aws-cdk/aws-s3-deployment';
import * as aws_cloudfront from '@aws-cdk/aws-cloudfront';

interface IWebSiteDeploymentProps {
  destinationBucket: aws_s3.IBucket;
  distribution?: aws_cloudfront.IDistribution;
}

export default class WebsiteDeployment extends cdk.Construct {
  constructor(scope: cdk.Stack, id: string, props: IWebSiteDeploymentProps) {
    super(scope, id);
    new aws_s3_deployment.BucketDeployment(this, `${this.node.tryGetContext('appName')}-bucket-deploymnet`, {
      sources: [aws_s3_deployment.Source.asset("../website/build")],
      destinationBucket: props.destinationBucket,
      // distribution: props.distribution || undefined,
      // distributionPaths: props.distribution ? ["/index.html"] : undefined,
    });
  }
}
