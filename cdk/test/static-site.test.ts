import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import { StaticSiteStack } from '../lib/static-site-stack'

const mockProps = {
  env: {
    account: '123456789',
    region: 'us-east-1',
  },
  domainName: 'www.domain.local',
  subjectAlternativeNames: ['domain.local'],
}

test('Defaults: no API, no WAF, yes Deployment', () => {
  const app = new cdk.App()
  const stack = new StaticSiteStack(app, 'MyTestStack', {...mockProps})
  const template = Template.fromStack(stack)
  const noWaf = Object.keys(template.findResources('AWS::WAFv2::WebACL')).length === 0
  const noApi = Object.keys(template.findResources('AWS::ApiGateway::RestApi')).length === 0
  expect(noWaf).toBe(true)
  expect(noApi).toBe(true)
  template.hasResource('Custom::CDKBucketDeployment', {})
})

test('WAF enabled', () => {
  const app = new cdk.App()
  const stack = new StaticSiteStack(app, 'WafEnabled', {...mockProps, wafEnabled: true, apiEnabled: true})
  const template = Template.fromStack(stack)
  template.hasResource('AWS::WAFv2::WebACL', {})
})

test('API enabled', () => {
  const app = new cdk.App()
  const stack = new StaticSiteStack(app, 'ApiEnabled', {...mockProps, apiEnabled: true,})
  const template = Template.fromStack(stack)
  template.hasResource('AWS::ApiGateway::RestApi', {})
})

test('Deployment skipped', () => {
  const app = new cdk.App()
  const stack = new StaticSiteStack(app, 'MyTestStack', {...mockProps, skipDeployment: true})
  const template = Template.fromStack(stack)
  const noDeploy = Object.keys(template.findResources('Custom::CDKBucketDeployment')).length === 0
  expect(noDeploy).toBe(true)
})
