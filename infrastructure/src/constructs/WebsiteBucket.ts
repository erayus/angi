import { Stack, aws_s3, CfnOutput, RemovalPolicy, aws_s3_deployment } from "aws-cdk-lib";
import { Construct } from "constructs";
import CloudfrontDistribution from "./CloudFrontDistribution";


export default class WebsiteBucket extends Construct {
    public readonly bucket: aws_s3.IBucket;
  
    constructor(scope: Stack, id: string){
      super(scope,id)  
     
        this.bucket = new aws_s3.Bucket(scope, "Website Bucket", {
          bucketName: "smartmenu.erayus.com",
          websiteIndexDocument: "index.html",
          websiteErrorDocument: "index.html",
          publicReadAccess: true      ,
          autoDeleteObjects: true ,
          removalPolicy: RemovalPolicy.DESTROY
        });
  
        new CfnOutput(scope, 'output_bucketName', {
          exportName: 'smartmenu-bucket-name',
          value: this.bucket.bucketName
        })
  
        new CfnOutput(scope, 'output_bucketDomainName', {
          exportName: 'smartmenu-bucket-domain-name',
          value: `https://${this.bucket.bucketDomainName}`
        })
    }
  }