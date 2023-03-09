import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_cognito as cognito, aws_apigateway as agw, aws_s3 as s3, aws_dynamodb as ddb, aws_iam as iam } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { PythonFunction, PythonLayerVersion } from "@aws-cdk/aws-lambda-python-alpha";
import { AuthorizationType, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const itemTable = new ddb.Table(this, "ItemTable", {
      partitionKey: { name: "item_id", type: ddb.AttributeType.STRING },
      sortKey: { name: "created_at", type: ddb.AttributeType.NUMBER },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });

    const fileAssetBucket = new s3.Bucket(this, "FileAssetBucket", {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [s3.HttpMethods.POST, s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedOrigins: ["*"],
          exposedHeaders: ["x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2", "ETag"],
        },
      ],
    });

    // Cognito
    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const client = userPool.addClient("WebClient", {
      userPoolClientName: "WebClient",
      idTokenValidity: cdk.Duration.days(1),
      accessTokenValidity: cdk.Duration.days(1),
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
    });

    const identityPool = new cognito.CfnIdentityPool(this, "app-identity-pool", {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: client.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    // file保存用 S3 への権限付与
    const authenticatedRolePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
          resources: [fileAssetBucket.bucketArn, `${fileAssetBucket.bucketArn}/*`],
        }),
      ],
    });

    // authenticated Users用のRole
    const authenticatedRole = new iam.Role(this, "CognitoDefaultAuthenticatedRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: { "cognito-identity.amazonaws.com:aud": identityPool.ref },
          "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "authenticated" },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      inlinePolicies: {
        authenticatedRolePolicy,
      },
    });

    const authorizer = new agw.CognitoUserPoolsAuthorizer(this, "Authorizer", {
      cognitoUserPools: [userPool],
    });

    new cognito.CfnIdentityPoolRoleAttachment(this, "DefaultValid", {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authenticatedRole.roleArn,
      },
    });

    // Lambdaレイヤー·関数
    const commonLayer = new PythonLayerVersion(this, "CommonLayer", {
      entry: "lambda/layer/common",
      compatibleRuntimes: [Runtime.PYTHON_3_9],
    });

    const handler = new PythonFunction(this, "Handler", {
      runtime: Runtime.PYTHON_3_9,
      entry: "lambda/web-api/",
      index: "index.py",
      memorySize: 256,
      timeout: Duration.seconds(25),
      environment: {
        ITEM_TABLE_NAME: itemTable.tableName,
        ALLOW_ORIGIN: "*",
      },
      layers: [commonLayer],
    });

    itemTable.grantFullAccess(handler);

    const api = new agw.RestApi(this, "Api", {
      deployOptions: {
        stageName: "api",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: agw.Cors.ALL_ORIGINS,
        allowMethods: agw.Cors.ALL_METHODS,
      },
    });

    // API Gatewayが直接レスポンスを返す場合も同様にCORSヘッダーを付加するための設定
    api.addGatewayResponse(`Gwr4xx`, {
      type: agw.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        // ''で値を囲む必要がある模様
        "Access-Control-Allow-Origin": "'*'",
      },
    });

    api.addGatewayResponse(`Gwr5xx`, {
      type: agw.ResponseType.DEFAULT_5XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
      },
    });

    const integration = new LambdaIntegration(handler);
    const proxy = api.root.addResource("{proxy+}");

    proxy.addMethod("ANY", integration, {
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    });

    new CfnOutput(this, "CognitoUserPoolId", {
      value: userPool.userPoolId,
      description: "userPoolId for frontend settings",
    });

    new CfnOutput(this, "CognitoUserPoolWebClientId", {
      value: client.userPoolClientId,
      description: "clientId for frontend settings",
    });

    new CfnOutput(this, "CognitoIdentityPoolId", {
      value: identityPool.ref,
      description: "identityPoolId for frontend settings",
    });

    new CfnOutput(this, "FileAssetS3BuckentName", {
      value: fileAssetBucket.bucketName,
      description: "FileAssetS3 Bucket Name for frontend settings",
    });
  }
}
