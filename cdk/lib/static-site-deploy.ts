import * as path from 'path'
import { Construct } from 'constructs'
import {
  Duration,
  Stack,
  StackProps,
  aws_s3 as s3,
  aws_s3_deployment as deployment,
} from 'aws-cdk-lib'

export interface StaticDeployProps extends StackProps {
  bucket: s3.Bucket,
}

export class StaticSiteDeploy extends Stack {
  constructor(scope: Construct, id: string, props: StaticDeployProps) {
    super(scope, id, props)

    // Deploy the static content.
    new deployment.BucketDeployment(this, 'staticBucketDeployment', {
      sources: [deployment.Source.asset(path.join(__dirname, '../../dist'))],
      destinationKeyPrefix: '/',
      destinationBucket: props.bucket,
      cacheControl: [
        deployment.CacheControl.maxAge(Duration.seconds(0)),
        deployment.CacheControl.mustRevalidate(),
        deployment.CacheControl.setPublic(),
      ],
    })

  }
}
