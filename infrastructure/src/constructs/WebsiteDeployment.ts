import { aws_s3, aws_s3_deployment, aws_cloudfront, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

interface IWebSiteDeploymentProps {
  destinationBucket: aws_s3.IBucket;
  distribution: aws_cloudfront.IDistribution;
}

export default class WebsiteDeployment extends Construct {
  constructor(scope: Stack, id: string, props: IWebSiteDeploymentProps) {
    super(scope, id);
    new aws_s3_deployment.BucketDeployment(this, "DeployWebsite", {
      sources: [aws_s3_deployment.Source.asset("../website/build")],
      destinationBucket: props.destinationBucket,
      distribution: props.distribution,
      distributionPaths: ["/index.html"],
    });
  }
}
