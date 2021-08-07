import { Stack, aws_cloudfront, aws_route53, CfnOutput } from "aws-cdk-lib";
import { CloudFrontTarget } from "aws-cdk-lib/lib/aws-route53-targets";
import { Construct } from "constructs";

interface IRoute53ARecord {
    distribution: aws_cloudfront.CloudFrontWebDistribution
  }
  
  export default class Route53ARecord extends Construct {
      constructor(scope: Stack, id: string, props: IRoute53ARecord){
          super(scope,id)
        
            // Creation of the A Record in Route 53 to connection the bucket with Cloudfront
            const zone = aws_route53.HostedZone.fromLookup(scope, 'Zone', { domainName: 'erayus.com' });
            const ARecord = new aws_route53.ARecord(scope, "CarsWebARecord", {
              recordName: "smartmenu.erayus.com",
              target: aws_route53.RecordTarget.fromAlias(new CloudFrontTarget(props.distribution)),
              zone: zone
            })
  
            new CfnOutput(scope, 'output_websiteUrl', {
              exportName: 'smartmenu-websiteUrl',
              value: ARecord.domainName
            })
      }
  }