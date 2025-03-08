import path = require('node:path');
import { Construct } from 'constructs';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

import { ObjectStore } from './object-store';
import { Cdn } from './cdn';

export interface DeploymentProps {
  readonly objectStore: ObjectStore
  readonly cdn: Cdn
}

export class Deployment extends Construct {
  private props: DeploymentProps;

  constructor(scope: Construct, id: string, props: DeploymentProps) {
    super(scope, id);
    this.props = props;
    this.createDeployment()
  }

  private createDeployment() {
    new BucketDeployment(this, 'staticBucketDeployment', {
      sources: [Source.asset(path.join(__dirname, '../../dist'))],
      destinationKeyPrefix: '/',
      destinationBucket: this.props.objectStore.bucket,
      distribution: this.props.cdn.distribution,
      distributionPaths: ['/*'],
    })
  }

}