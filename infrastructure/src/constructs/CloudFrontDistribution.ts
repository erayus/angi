import * as cdk from '@aws-cdk/core';
import * as aws_s3 from '@aws-cdk/aws-s3';
import * as aws_cloudfront from '@aws-cdk/aws-cloudfront';
interface ICloudFrontDistributionProps {
  bucket: aws_s3.IBucket;
}

export default class CloudfrontDistribution extends cdk.Construct {
  public readonly distribution: aws_cloudfront.CloudFrontWebDistribution;

  constructor(scope: cdk.Stack, id: string, props: ICloudFrontDistributionProps) {
    super(scope, id);
    // Provision of cloudfront distribution
    const acmCertRefArn = scope.formatArn({
      service: "acm",
      region: "us-east-1",
      resource: "certificate",
      resourceName: "0bed8ba1-d090-47f3-9ddf-d6db173a3f33",
    });

    this.distribution = new aws_cloudfront.CloudFrontWebDistribution(
      scope,
      `${this.node.tryGetContext('appName')}-web-distribution`,
      {
        viewerCertificate: {
            aliases: [props.bucket.bucketName],
            props: {
                acmCertificateArn: acmCertRefArn,
                sslSupportMethod: aws_cloudfront.SSLMethod.SNI,
            }
        },
        viewerProtocolPolicy:  aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: props.bucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        errorConfigurations: [
            {
                errorCode: 403,
                responseCode: 200,
                errorCachingMinTtl: 3600,
                responsePagePath: '/index.html'
            }
        ] ,

        defaultRootObject: "index.html",
      }
    );
  }
}
