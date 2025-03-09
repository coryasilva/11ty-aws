import { Duration } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class ObjectStore extends Construct {
  bucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.bucket = this.createBucket();
  }

  private createBucket() {
    return new Bucket(this, "staticBucket", {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [
        { abortIncompleteMultipartUploadAfter: Duration.days(2) },
        { noncurrentVersionExpiration: Duration.days(90) },
      ],
    });
  }
}
