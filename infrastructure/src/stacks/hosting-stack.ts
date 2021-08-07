import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import CloudfrontDistribution from '../constructs/CloudFrontDistribution';
import Route53ARecord from '../constructs/Route53ARecord';
import WebsiteBucket from '../constructs/WebsiteBucket';

export class HostingStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webBucket = new WebsiteBucket(
      this, 
      'smartmenu-website-bucket')


    const route53ARecord = new Route53ARecord(
      this,
      'smartMenu-route53-ARecord',
      {distribution: webBucket.websiteCloudfrontDistribution.distribution}
    ) 
  }
}
