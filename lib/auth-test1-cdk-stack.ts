import { CDKContext } from "../layer/types";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamoDB from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
export class AuthTestCdkStack extends cdk.Stack {
  public readonly ddbTableProperty: dynamoDB.Table;
  constructor(
    scope: Construct,
    id: string,
    context: CDKContext,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // lambda function construct
    const authTestFunction = new lambda.Function(this, "authHandler", {
      runtime: lambda.Runtime.NODEJS_14_X, // execution environment (Node Version)
      code: lambda.Code.fromAsset("src/lambda"), // code loaded from "lambda-function" directory
      handler: "test.handler", // file is "test", function is "handler"
      functionName: "authtestfunction",
    });

    const authLoginFunction = new lambda.Function(this, "authlogin", {
      runtime: lambda.Runtime.NODEJS_14_X, // execution environment (Node Version)
      code: lambda.Code.fromAsset("src/lambda"), // code loaded from "lambda-function" directory
      handler: "login.handler", // file is "test", function is "handler"
      functionName: "authloginfunction",
    });

    // API construct
    const authTestApi = new apigw.LambdaRestApi(this, "authTestAPI", {
      handler: authTestFunction,
      proxy: false,
      restApiName: "authtestapi",
      deployOptions: {
        stageName: context.apiStage,
      },
    });

    // lambda-function (authTestFunction) and api (authTestApi) integration
    const authTestIntegration = new apigw.LambdaIntegration(authTestFunction);
    const authLoginIntegration = new apigw.LambdaIntegration(authLoginFunction);

    // defining resources and methods in apigateway
    const items = authTestApi.root.addResource("test");
    items.addMethod("GET", authTestIntegration);

    const login = authTestApi.root.addResource("login");
    login.addMethod("POST", authLoginIntegration);

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
    this.ddbTableProperty = authTestCdkTable; // allowing property

    // don't know what this is
    authTestCdkTable.addGlobalSecondaryIndex({
      indexName: `itemType-index`,
      partitionKey: { name: "itemType", type: dynamoDB.AttributeType.STRING },
      projectionType: dynamoDB.ProjectionType.ALL,
    });

    // StackOutput
    // 1. apigateway output
    new cdk.CfnOutput(this, "GatewayUrl", {
      value: authTestApi.url,
      exportName: "authtestapi",
    });
    // 2. bucket output
    new cdk.CfnOutput(this, "authTestCdkBucket", {
      value: authTestCdkBucket.bucketArn,
      exportName: `${context.appName}BucketArn-${context.environment}`,
    });
    // 3. table output
    new cdk.CfnOutput(this, "authTestCdkTable", {
      value: authTestCdkTable.tableArn,
      exportName: `${context.appName}TableArn-${context.environment}`,
    });
  }
}
