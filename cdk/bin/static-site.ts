#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { StaticSiteStack } from '../lib/static-site-stack'
import { StaticSiteDeploy } from '../lib/static-site-deploy'

const app = new App()
const {bucket, distribution} = new StaticSiteStack(app, 'StaticSiteInfra', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  // The domain name of your Route53 hosted zone: ex: mysite.com
  hostedZoneDomainName: 'corysilva.com',
  // Domain name; used for DNS record and TLS cert. ex: www.mysite.com
  domainName: '11ty-aws.corysilva.com',
  // SANs for cert. example: mysite.com
  subjectAlternativeNames: [],
  // if true, this will create a DNS alias for `hostedZoneDomainName` that points to the newly created cloudfront distro.
  apexAlias: false,
  // if true, this will configure an AWS managed WAF on your cloudfront distro. THIS WILL COST MONEY -- IT IS NOT FREE TIER ELIGIBLE
  wafEnabled: false,
})

new StaticSiteDeploy(app, 'StaticSiteDeploy', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  bucket,
  distribution,
})
