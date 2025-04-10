# 11ty-aws

11ty + Alpine + Tailwind in AWS.

Full stack javascript with very little context switching.

Yes, using Netlify is much easier and requires far less code, but some enterprises will not want to use Netilfy or you may just have other assets already in AWS.

## Getting Started

1. Configure your `awscli`
2. Update file `cdk/bin/static-site.ts`
3. `npm run build`
3. `cd cdk && npm run cdk deploy StaticSite`

### 11ty commands

```sh
npm install
# Dev
npm start
# Lint
npm run lint
# Build
npm run build
# Build and Preview
npm run build && npx serve dist
```

### aws-cdk commands

```sh
# CDK commands
cd cdk && npm install
# compile typescript to js
npm run build
# watch for changes and compile
npm run watch
# perform the jest unit tests
npm run test
# deploy this stack to your default AWS account/region
npm run cdk deploy staticSite
# compare deployed stack with current state
npm run cdk diff
# emits the synthesized CloudFormation template
npm run cdk synth
```

### Directory structure

Mono-repo directory structure.

NOTE: Domain name config is repeated in a couple spots:
- cdk/bin/static-site.ts
- src/_data/site.js

```sh
.
├── cdk # AWS CDK stack for cloudfront and api
│   ├── bin # Cloudformation stack configuration
│   ├── cloudfront # AWS Cloudfront functions
│   ├── lib # Cloudformation stack
├── dist # Output directory of final built site
├── public # Assets simply copied to the root of dist
├── src # Website source
│   ├── _data # Global data; automatically included
│   ├── _includes # Components and templates/layouts
│   ├── _styles # Post css source
│   ├── _scripts # Javascript source
│   ├── tailwind.css # Tailwind includes and custom style layers
├── .eleventy.js # Eleventy site generator settings
├── package-lock.json
├── package.json
└── tailwind.config.js # Tailwind CSS configurations (design tokens)
```

## Todo

- Add Serverless

## Flow Diagram

![Flow Diagram](./flow-diagram.svg)

## Thanks

- [Adrian Hesketh](https://github.com/a-h) for publishing his [CDK source](https://github.com/aws-samples/serverless-patterns/tree/main/cdk-cloudfront-to-s3-and-lambda)

- [Matt Waler](https://mattwaler.com/) for his [eleventy starter](https://github.com/mattwaler/tea-stack)

