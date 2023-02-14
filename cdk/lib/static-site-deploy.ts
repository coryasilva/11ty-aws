import * as path from 'path'
import { Construct } from 'constructs'
import {
  Stack,
  StackProps,
  aws_cloudfront as cloudfront,
  aws_s3 as s3,
  aws_s3_deployment as deployment,
} from 'aws-cdk-lib'

export interface StaticDeployProps extends StackProps {
  bucket: s3.Bucket,
  distribution: cloudfront.Distribution,
}

export class StaticSiteDeploy extends Stack {
  constructor(scope: Construct, id: string, props: StaticDeployProps) {
    super(scope, id, props)

    // Deploy the static content.
    new deployment.BucketDeployment(this, 'staticBucketDeployment', {
      sources: [deployment.Source.asset(path.join(__dirname, '../../dist'))],
      destinationKeyPrefix: '/',
      destinationBucket: props.bucket,
      distribution: props.distribution,
      distributionPaths: ['/*'],
    })

  }
}
