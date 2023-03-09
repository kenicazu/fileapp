import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { aws_s3 as s3, aws_cloudfront as cloudfront, aws_s3_deployment as s3deploy } from "aws-cdk-lib";
import { Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      websiteErrorDocument: "index.html",
      websiteIndexDocument: "index.html",
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    const websiteIdentity = new cloudfront.OriginAccessIdentity(this, "WebsiteIdentity");

    websiteBucket.grantRead(websiteIdentity);

    const websiteDistribution = new cloudfront.CloudFrontWebDistribution(this, "WebsiteDistribution", {
      errorConfigurations: [
        {
          errorCachingMinTtl: 300,
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/index.html",
        },
      ],
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: websiteIdentity,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
            },
          ],
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
    });

    new s3deploy.BucketDeployment(this, "WebsiteDeploy", {
      sources: [Source.asset("../app/build")],
      destinationBucket: websiteBucket,
      distribution: websiteDistribution,
      distributionPaths: ["/*"],
      memoryLimit: 1024,
    });

    new CfnOutput(this, "HostedUrl", { value: `https://${websiteDistribution.distributionDomainName}` });
  }
}
