import { Construct } from "constructs";
import { aws_cloudfront, aws_s3, Stack, aws_cloudfront_origins } from "aws-cdk-lib";

interface ICloudFrontDistributionProps {
  bucket: aws_s3.IBucket;
}

export default class CloudfrontDistribution extends Construct {
  public readonly distribution: aws_cloudfront.CloudFrontWebDistribution;

  constructor(scope: Stack, id: string, props: ICloudFrontDistributionProps) {
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
      "CarsWebDistribution",
      {
          

        // aliasConfiguration: {
        //   names: [props.bucket.bucketName],
        //   acmCertRef: acmCertRefArn,
        //   sslMethod: aws_cloudfront.SSLMethod.SNI,
        //   securityPolicy: aws_cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
        // },
        viewerCertificate: {
            aliases: [props.bucket.bucketName],
            props: {
                acmCertificateArn: acmCertRefArn,
                sslSupportMethod: aws_cloudfront.SSLMethod.SNI,
            }
        },
        viewerProtocolPolicy:  aws_cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: props.bucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        defaultRootObject: "index.html",
      }
    );
  }
}
