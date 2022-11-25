import { CDKContext } from "../schema-type/types";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamoDB from "aws-cdk-lib/aws-dynamodb";

export class AuthTestCdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    context: CDKContext,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // s3 bucket construct
    const authTestCdkBucket = new s3.Bucket(this, "authBucket", {
      bucketName: `authtestbucket${context.environment}`,
      encryption: context.s3Encrypt
        ? s3.BucketEncryption.S3_MANAGED
        : s3.BucketEncryption.UNENCRYPTED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // dynamoDB table construct
    const authTestCdkTable = new dynamoDB.Table(this, "authTable", {
      tableName: `authtesttable${context.environment}`,
      partitionKey: { name: "username", type: dynamoDB.AttributeType.STRING },
      sortKey: { name: "email", type: dynamoDB.AttributeType.STRING },
      billingMode: dynamoDB.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: context.ddbPITrecovery,
    });

    // StackOutput
    new cdk.CfnOutput(this, "authTestCdkBucket", {
      value: authTestCdkBucket.bucketArn,
      exportName: `${context.appName}BucketArn-${context.environment}`,
    });

    new cdk.CfnOutput(this, "authTestCdkTable", {
      value: authTestCdkTable.tableArn,
      exportName: `${context.appName}TableArn-${context.environment}`,
    });
  }
}
