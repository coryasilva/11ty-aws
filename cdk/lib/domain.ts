import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import {
  ARecord,
  ARecordProps,
  AaaaRecord,
  AaaaRecordProps,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

export interface DomainProps {
  readonly domainName: string;
  readonly subjectAlternativeNames?: string[];
}

export class Domain extends Construct {
  private props: DomainProps;
  hostedZone: IHostedZone;
  certificate: Certificate;

  get domainNames(): string[] {
    return [
      this.props.domainName,
      ...(this.props.subjectAlternativeNames ?? []),
    ];
  }

  constructor(scope: Construct, id: string, props: DomainProps) {
    super(scope, id);
    this.props = props;
    this.hostedZone = this.getHostedZone();
    this.certificate = this.createCertificate();
  }

  private getHostedZone() {
    const domainName = this.props.domainName.split('.').slice(1).join('.')
    return HostedZone.fromLookup(this, 'HostedZone', {
      domainName,
    });
  }

  private createCertificate() {
    return new Certificate(this, 'Certificate', {
      domainName: this.props.domainName,
      subjectAlternativeNames: this.props.subjectAlternativeNames,
      validation: CertificateValidation.fromDns(this.hostedZone),
    });
  }

  createDnsRecords(distribution: Distribution) {
    const recordProps: ARecordProps & AaaaRecordProps = {
      recordName: this.props.domainName,
      zone: this.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    };

    new ARecord(this, 'ARecordMain', {
      ...recordProps,
    });
    new AaaaRecord(this, 'AaaaRecordMain', {
      ...recordProps,
    });

    if (this.props.subjectAlternativeNames?.length) {
      let i = 1;
      for (const alternateName of this.props.subjectAlternativeNames) {
        new ARecord(this, 'ARecordAlt' + i, {
          ...recordProps,
          recordName: `${alternateName}.`,
        });
        new AaaaRecord(this, 'AaaaRecordAlt' + i, {
          ...recordProps,
          recordName: `${alternateName}.`,
        });
        i++;
      }
    }
  }
}