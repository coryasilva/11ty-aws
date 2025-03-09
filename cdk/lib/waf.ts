import { Fn } from "aws-cdk-lib";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { CfnLoggingConfiguration, CfnWebACL } from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";

export class Waf extends Construct {
  webAcl: CfnWebACL;
  logGroup: LogGroup;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.webAcl = this.createWaf();
    this.logGroup = this.createLogGroup();
    this.createLogConfig();
  }

  private createWaf() {
    return new CfnWebACL(this, "WebAcl", {
      defaultAction: { allow: {} },
      scope: "GLOBAL",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: "StaticSiteWaf",
      },
      rules: [
        {
          name: "AWS-AWSManagedRulesCommonRuleSet",
          priority: 100,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesCommonRuleSet",
              excludedRules: [],
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "AWS-Common",
          },
          overrideAction: { none: {} },
        },
        {
          name: "AWS-AWSManagedRulesKnownBadInputsRuleSet",
          priority: 200,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesKnownBadInputsRuleSet",
              excludedRules: [],
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "AWS-KnownBadInputs",
          },
          overrideAction: { none: {} },
        },
        {
          name: "AWS-AWSManagedRulesAmazonIpReputationList",
          priority: 300,
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesAmazonIpReputationList",
              excludedRules: [],
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "AWS-IpReputationList",
          },
          overrideAction: { none: {} },
        },
      ],
    });
  }

  private createLogGroup() {
    const wafName = Fn.select(3, Fn.split(":", this.webAcl.attrLabelNamespace));
    return new LogGroup(this, "LogGroup", {
      logGroupName: `${wafName}-LogGroup`,
      retention: RetentionDays.TWO_YEARS,
    });
  }

  private createLogConfig() {
    return new CfnLoggingConfiguration(this, "LogConfig", {
      logDestinationConfigs: [this.logGroup.logGroupArn],
      resourceArn: this.webAcl.attrArn,
    });
  }
}
