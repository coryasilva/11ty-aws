import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import type { Distribution } from "aws-cdk-lib/aws-cloudfront";
import type { Bucket } from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

import { Api } from "./api";
import { Cdn } from "./cdn";
import { Deployment } from "./deployment";
import { Domain } from "./domain";
import { ObjectStore } from "./object-store";
import { Waf } from "./waf";

export interface StaticSiteProps extends StackProps {
  /** Canonical domain name */
  domainName: string;
  /** Subject alternative names for cert */
  subjectAlternativeNames: string[];
  /** Skip the bucket deployment step */
  skipDeployment?: boolean;
  /** Create an API gateway or not */
  apiEnabled?: boolean;
  /** Create a WAF or not */
  wafEnabled?: boolean;
}

export class StaticSiteStack extends Stack {
  private domain: Domain;
  private objectStore: ObjectStore;
  private waf?: Waf;
  private cdn: Cdn;
  private api?: Api;
  public readonly bucket: Bucket;
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id, props);

    this.objectStore = new ObjectStore(this, "ObjectStore");

    this.domain = new Domain(this, "Domain", {
      domainName: props.domainName,
      subjectAlternativeNames: props.subjectAlternativeNames,
    });

    // Optional; WAF ~$9 a month
    if (props.wafEnabled) {
      this.waf = new Waf(this, "Waf");
    }

    if (props.apiEnabled) {
      this.api = new Api(this, "Api");
    }

    this.cdn = new Cdn(this, "Cdn", {
      domainName: props.domainName,
      domain: this.domain,
      objectStore: this.objectStore,
      waf: this.waf,
      api: this.api,
    });

    this.domain.createDnsRecords(this.cdn.distribution);

    if (!props.skipDeployment) {
      new Deployment(this, "Deployment", {
        objectStore: this.objectStore,
        cdn: this.cdn,
      });
    }

    new CfnOutput(this, "DistributionURL", {
      value: `https://${this.cdn.distribution.distributionDomainName}`,
    });
    new CfnOutput(this, "URL", { value: `https://${props.domainName}` });
  }
}
