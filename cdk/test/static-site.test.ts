import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { StaticSiteStack } from '../lib/static-site-stack'

const mockProps = {
  env: {
    region: 'us-east-1',
  },
  hostedZoneDomainName: 'domain.local',
  domainName: 'www.domain.local',
  subjectAlternativeNames: ['domain.local'],
  apexAlias: true,
  wafEnabled: false,
}

const app = new cdk.App()
const stack = new StaticSiteStack(app, 'MyTestStack', mockProps)
const template = Template.fromStack(stack)

test('S3 bucket is private', () => {
  template.hasResourceProperties('AWS::S3::Bucket', {
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  })
})
