import { NameGenerator } from './../utils/name-generator';
import * as cdk from '@aws-cdk/core';
import * as aws_cloudfront from '@aws-cdk/aws-cloudfront';
import * as aws_route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import { ConfigProvider } from '../utils/config-provider';

interface IRoute53ARecord {
    distribution: aws_cloudfront.CloudFrontWebDistribution
  }
  
  export default class Route53ARecord extends cdk.Construct {
      constructor(scope: cdk.Stack, id: string, props: IRoute53ARecord){
          super(scope,id)
        
            // Creation of the A Record in Route 53 to connection the bucket with Cloudfront
            const zone = aws_route53.HostedZone.fromLookup(scope, 'Zone', { domainName: 'erayus.com' });
            const appName = ConfigProvider.Context(scope).AppName;
            
            const ARecord = new aws_route53.ARecord(scope, `${appName}-ARecord`, {
              recordName: `${appName}.erayus.com`,
              target: aws_route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(props.distribution)),
              zone: zone
            })
            
            new cdk.CfnOutput(scope, `${appName}-web-url`, {
              exportName: `${NameGenerator.generateConstructName(scope, 'website-url'), ConfigProvider.Context(scope).IsDevelopment}`,
              value: ARecord.domainName
            })
      }
  }