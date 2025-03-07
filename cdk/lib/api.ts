import { Construct } from 'constructs';

import { Domain } from './domain';
import { AccessLogFormat, ApiKey, IResource, LogGroupLogDestination, MockIntegration, PassthroughBehavior, Period, RestApi, UsagePlan } from 'aws-cdk-lib/aws-apigateway';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export interface ApiProps {}

export class Api extends Construct {
  restApi: RestApi;
  logGroup: LogGroup
  apiResource: IResource
  mockResource: IResource
  usagePlan: UsagePlan
  apiKeySecret: Secret
  apiKey: ApiKey

  constructor(scope: Construct, id: string, props?: ApiProps) {
    super(scope, id);
    this.logGroup = this.createLogGroup();
    this.restApi = this.createRestApi();
    this.apiResource = this.restApi.root.addResource('api')
    this.mockResource = this.apiResource.addResource('mock')
    this.addMockResource()
    this.usagePlan = this.createUsagePlan()
    this.apiKeySecret = this.createApiKeySecret()
    this.apiKey = this.createApiKey()
    this.usagePlan.addApiKey(this.apiKey)
  }

  private createLogGroup() {
    return new LogGroup(this, 'LogGroup', {
      retention: RetentionDays.TWO_YEARS,
    });
  }

  private createRestApi() {
    return new RestApi(this, 'RestApi', {
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(this.logGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
        metricsEnabled: true,
      },
    })
  }

  private addMockResource() {
    this.mockResource.addMethod('POST', new MockIntegration({
      integrationResponses: [{ statusCode: '200' }],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: { 'application/json': '{"statusCode": 200}' },
    }))
  }

  private createUsagePlan() {
    return this.restApi.addUsagePlan('UsagePlan', {
      throttle: {
        rateLimit: 10,
        burstLimit: 20
      },
      quota: {
        limit: 1000,
        offset: 0,
        period: Period.DAY
      },
      apiStages: [{
        stage: this.restApi.deploymentStage,
      }]
    })
  }

  private createApiKeySecret() {
    return new Secret(this, 'ApiKeySecret', {
      generateSecretString: {
        passwordLength: 32,
        excludePunctuation: true,
      }
    })
  }

  private createApiKey() {
    return new ApiKey(this, 'ApiKey', {
      value: this.apiKeySecret.secretValue.toString()
    })
  }
}