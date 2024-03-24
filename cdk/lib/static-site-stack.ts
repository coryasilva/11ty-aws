import * as path from 'path'
import { Construct } from 'constructs'
import {
  CfnOutput,
  Duration,
  Stack,
  StackProps,
  aws_apigateway as apigateway,
  aws_certificatemanager as certificatemanager,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as nodejs,
  aws_route53 as route53,
  aws_route53_targets as targets,
  aws_s3 as s3,
  aws_wafv2 as wafv2,
  aws_secretsmanager as secretsmanager,
} from 'aws-cdk-lib'

export interface StaticSiteProps extends StackProps {
  hostedZoneDomainName: string,
  domainName: string,
  subjectAlternativeNames: string[],
  apexAlias: boolean,
  wafEnabled: boolean,
}
export class StaticSiteStack extends Stack {
  public readonly bucket: s3.Bucket
  public readonly distribution: cloudfront.Distribution

  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id, props)

    const apiDefaultHandler = new nodejs.NodejsFunction(this, 'apiDefaultHandler', {
      functionName: `${id}ApiDefault`,
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'get',
      entry: path.join(__dirname, '../../api/default/index.js'),
      memorySize: 128,
    })

    const apiGateway = new apigateway.LambdaRestApi(this, 'apiGateway', {
      restApiName: `${id}Api`,
      handler: apiDefaultHandler,
      proxy: false,
    })

    // /api
    const apiRoute = apiGateway.root.addResource('api')
    const apiRouteDefaultGet = apiRoute.addMethod(
      'GET',
      new apigateway.LambdaIntegration(apiDefaultHandler),
      { apiKeyRequired: true }
    )

    const usagePlan = apiGateway.addUsagePlan('UsagePlanLow', {
      name: 'Low',
      throttle: {
        rateLimit: 4,
        burstLimit: 2
      },
      quota: {
        limit: 10,
        offset: 0,
        period: apigateway.Period.DAY
      },
      apiStages: [{
        stage: apiGateway.deploymentStage,
        throttle: [{
          method: apiRouteDefaultGet,
          throttle: {
            rateLimit: 4,
            burstLimit: 2
          }
        }]
      }]
    })

    const apiKeySecret = new secretsmanager.Secret(this, 'cf-api-key-secret', {
      generateSecretString: {
        passwordLength: 32,
        excludePunctuation: true,
      }
    })

    const apiKey = new apigateway.ApiKey(this, 'cf-api-key', {
      value: apiKeySecret.secretValue.toString()
    })

    usagePlan.addApiKey(apiKey)

    // Cloudfront Function to rewrite paths and do redirects
    const staticRewriteFunction = new cloudfront.Function(this, 'staticRewrite', {
      functionName: `${id}StaticRewrite`,
      code: cloudfront.FunctionCode.fromFile({
        filePath: path.join(__dirname, '../../cloudfront/static-rewrite.js'),
      }),
    })

    // Optional WAF ~$9 a month
    let waf = undefined
    if (props.wafEnabled === true) {
      waf = new wafv2.CfnWebACL(this, 'staticSiteWaf', {
        name: `${id}`,
        defaultAction: { block: {} },
        scope: 'REGIONAL',
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: 'StaticSite',
          sampledRequestsEnabled: true,
        },
        rules: [
          {
            name: 'AWS-AWSManagedRulesCommonRuleSet',
            priority: 100,
            statement: {
              managedRuleGroupStatement: {
                vendorName: 'AWS',
                name: 'AWSManagedRulesCommonRuleSet',
                excludedRules: [],
              },
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'AWS-AWSManagedRulesCommonRuleSet',
            },
            overrideAction: { none: {} },
          },
          {
            name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
            priority: 200,
            statement: {
              managedRuleGroupStatement: {
                vendorName: 'AWS',
                name: 'AWSManagedRulesKnownBadInputsRuleSet',
                excludedRules: [],
              },
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
            },
            overrideAction: { none: {} },
          },
          {
            name: 'AWS-AWSManagedRulesAmazonIpReputationList',
            priority: 300,
            statement: {
              managedRuleGroupStatement: {
                vendorName: 'AWS',
                name: 'AWSManagedRulesAmazonIpReputationList',
                excludedRules: [],
              },
            },
            visibilityConfig: {
              sampledRequestsEnabled: true,
              cloudWatchMetricsEnabled: true,
              metricName: 'AWS-AWSManagedRulesAmazonIpReputationList',
            },
            overrideAction: { none: {} },
          },
        ],
      })
    }

    // Create a bucket for static content.
    const staticBucket = new s3.Bucket(this, 'staticBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [
        { abortIncompleteMultipartUploadAfter: Duration.days(2) },
        { noncurrentVersionExpiration: Duration.days(90) },
      ],
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
    })

    // Expose to construct for export
    this.bucket = staticBucket

    // Fetch hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'hostedZone', {
      domainName: props.hostedZoneDomainName,
    })

    // Create TLS Certificate
    const cert  = new certificatemanager.Certificate(this, 'cert', {
      domainName: props.domainName,
      subjectAlternativeNames: props.subjectAlternativeNames,
      validation: certificatemanager.CertificateValidation.fromDns(hostedZone),
    })

    // Creating a custom response headers policy -- all parameters optional
    const staticResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'staticResponseHeadersPolicy', {
      comment: 'Security headers for static sites',
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: "script-src 'self' 'unsafe-eval'; style-src 'self'; img-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; connect-src 'self'; default-src 'none'",
          override: true,
        },
        contentTypeOptions: {
          override: true,
        },
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.DENY,
          override: true,
        },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: false,
          preload: true,
          override: true,
        },
        xssProtection: {
          protection: true,
          modeBlock: true,
          override: true,
        },
      },
    })

    const apiResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'apiResponseHeadersPolicy', {
      comment: 'Security headers for api sites',
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: "default-src 'none'; frame-ancestors 'none'",
          override: true,
        },
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.DENY,
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: false,
          preload: true,
          override: true,
        },
      },
    })

    // Create a CloudFront OAI and configure policy for proper treatment of 404s
    const cfOriginAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'cfOriginAccessIdentity')
    const cloudfrontS3Access = new iam.PolicyStatement()
    cloudfrontS3Access.addActions('s3:GetObject')
    cloudfrontS3Access.addActions('s3:ListBucket')
    cloudfrontS3Access.addResources(staticBucket.bucketArn)
    cloudfrontS3Access.addResources(`${staticBucket.bucketArn}/*`)
    cloudfrontS3Access.addCanonicalUserPrincipal(
      cfOriginAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
    );
    staticBucket.addToResourcePolicy(cloudfrontS3Access);

    // Create Cloudfront distribution
    const staticDistribution = new cloudfront.Distribution(this, 'staticDistribution', {
      comment: `${id} website`,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      webAclId: props.wafEnabled === true ? waf?.attrArn : undefined,
      httpVersion: cloudfront.HttpVersion.HTTP2,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      certificate: cert,
      domainNames: [ props.domainName ].concat(props.subjectAlternativeNames),
      defaultBehavior: {
        origin: new origins.S3Origin(staticBucket, { originAccessIdentity: cfOriginAccessIdentity }),
        functionAssociations: [{
          function: staticRewriteFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        }],
        responseHeadersPolicy: staticResponseHeadersPolicy,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      additionalBehaviors: {
        'api/*': {
          origin: new origins.HttpOrigin(`${apiGateway.restApiId}.execute-api.${this.region}.${this.urlSuffix}`, {
            customHeaders: {
              'x-api-key': apiKeySecret.secretValue.toString(),
            },
            originPath: '/' + apiGateway.deploymentStage.stageName
          }),
          responseHeadersPolicy: apiResponseHeadersPolicy,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
      errorResponses: [{
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/404.html',
      }],
    })
    this.distribution = staticDistribution

    // Create A record for website
    const domainNameDnsRecord = new route53.ARecord(this, 'websiteAliasRecord', {
      zone: hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(staticDistribution)
      )
    })

    // Point Apex DNS to website record
    if (props.apexAlias) {
      new route53.ARecord(this, 'ApexAliasRecord', {
        zone: hostedZone,
        recordName: `${props.hostedZoneDomainName}`,
        target: route53.RecordTarget.fromAlias(
          new targets.Route53RecordTarget(domainNameDnsRecord)
        )
      })
    }

    new CfnOutput(this, 'websiteDistributionDomainName', { value: `https://${staticDistribution.distributionDomainName}` })
    new CfnOutput(this, 'websiteDomainName', { value: `https://${props.domainName}` })
  }
}
