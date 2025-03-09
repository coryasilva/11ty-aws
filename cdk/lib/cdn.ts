import { readFileSync } from "node:fs";
import * as path from "node:path";
import { Stack } from "aws-cdk-lib";
import {
  AllowedMethods,
  CachePolicy,
  Function as CfFunction,
  Distribution,
  FunctionCode,
  FunctionEventType,
  FunctionRuntime,
  HttpVersion,
  KeyValueStore,
  OriginRequestPolicy,
  PriceClass,
  ResponseHeadersPolicy,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";

import { HttpOrigin, S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import type { Api } from "./api";
import type { Domain } from "./domain";
import type { ObjectStore } from "./object-store";
import type { StaticSiteProps } from "./static-site-stack";
import type { Waf } from "./waf";

export interface CdnProps {
  readonly domainName: StaticSiteProps["domainName"];
  readonly domain: Domain;
  readonly objectStore: ObjectStore;
  readonly api?: Api;
  readonly waf?: Waf;
}

export class Cdn extends Construct {
  private props: CdnProps;
  keyValueStore: KeyValueStore;
  viewerRequestFunction: CfFunction;
  distribution: Distribution;

  constructor(scope: Construct, id: string, props: CdnProps) {
    super(scope, id);
    this.props = props;
    this.keyValueStore = new KeyValueStore(this, "KeyValueStore");
    this.viewerRequestFunction = this.createViewerRequestFunction();
    this.distribution = this.createDistribution();
    if (this.props.api) this.addApiBehavior();
  }

  private createViewerRequestFunction() {
    // Inject KV store id into function code
    const staticRewriteFunctionCode = readFileSync(
      path.join(__dirname, "../cloudfront/viewer-request.js"),
      "utf8",
    )
      .replace(
        "KEY_VALUE_STORE_ID_PLACEHOLDER",
        this.keyValueStore.keyValueStoreId,
      )
      .replace("CANONICAL_HOST", this.props.domainName);

    // Cloudfront Function to rewrite paths and do redirects
    return new CfFunction(this, "ViewerRequest", {
      code: FunctionCode.fromInline(staticRewriteFunctionCode),
      runtime: FunctionRuntime.JS_2_0,
      keyValueStore: this.keyValueStore,
    });
  }

  private createDistribution() {
    return new Distribution(this, "Distribution", {
      comment: this.props.domain.domainNames.join(","),
      priceClass: PriceClass.PRICE_CLASS_100,
      webAclId: this.props.waf ? this.props.waf.webAcl.attrArn : undefined,
      httpVersion: HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      certificate: this.props.domain.certificate,
      domainNames: this.props.domain.domainNames,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(
          this.props.objectStore.bucket,
        ),
        functionAssociations: [
          {
            function: this.viewerRequestFunction,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/404.html",
        },
      ],
    });
  }

  private addApiBehavior() {
    const apiOrigin = new HttpOrigin(
      `${this.props.api?.restApi.restApiId}.execute-api.${Stack.of(this).region}.${Stack.of(this).urlSuffix}`,
      {
        customHeaders: {
          "x-api-key":
            this.props.api?.apiKeySecret.secretValue.toString() ?? "secret",
        },
        originPath: `/${this.props.api?.restApi.deploymentStage.stageName}`,
      },
    );
    this.distribution.addBehavior("api/*", apiOrigin, {
      responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
      originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: CachePolicy.CACHING_DISABLED,
    });
  }
}
