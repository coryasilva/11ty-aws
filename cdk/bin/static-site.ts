#!/usr/bin/env node
import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { StaticSiteStack } from "../lib/static-site-stack";

const app = new App();

new StaticSiteStack(app, "StaticSite", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  domainName: "11ty-aws.corysilva.com",
  subjectAlternativeNames: [],
  skipDeployment: false,
  apiEnabled: true,
  wafEnabled: false, // THIS WILL COST MONEY -- IT IS NOT FREE TIER ELIGIBLE
});
