import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import CloudfrontDistribution from "../constructs/CloudFrontDistribution";
import Route53ARecord from "../constructs/Route53ARecord";
import WebsiteBucket from "../constructs/WebsiteBucket";
import WebsiteDeployment from "../constructs/WebsiteDeployment";

export class HostingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webBucket = new WebsiteBucket(this, "smartmenu-website-bucket");

    const cloudfrontDistribution = new CloudfrontDistribution(
      this,
      "smartmenu-cloudfront-distribution",
      { bucket: webBucket.bucket }
    );

    new Route53ARecord(
      this,
      "smartmenu-route53-ARecord",
      { distribution: cloudfrontDistribution.distribution }
    );

    new WebsiteDeployment(
      this,
      "smartmenu-websiteDeployment",
      { 
        destinationBucket: webBucket.bucket, 
        distribution: cloudfrontDistribution.distribution
      }
    ).node.addDependency(webBucket, cloudfrontDistribution);
  }
}
