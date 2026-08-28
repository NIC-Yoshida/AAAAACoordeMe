"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordeMeBackendStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const logs = require("aws-cdk-lib/aws-logs");
const path = require("path");

class CoordeMeBackendStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        // DynamoDB テーブル - ユーザー情報
        // 既存のテーブルを参照（SAMで作成済み）
        this.usersTable = dynamodb.Table.fromTableName(this, 'CoordeMeUsersTable', 'CoordeMeUsers');

        // Lambda関数
        const lambdaFunction = new lambda.Function(this, 'CoordeMeApiFunction', {
            functionName: 'coordeme-api-handler',
            runtime: lambda.Runtime.PYTHON_3_12, // 3.14は利用不可のため3.12に変更
            handler: 'app.lambda_handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/hello_world')),
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
            environment: {
                USERS_TABLE_NAME: this.usersTable.tableName,
            },
            logRetention: logs.RetentionDays.ONE_WEEK,
        });

        // Lambda に DynamoDB へのアクセス権限を付与
        this.usersTable.grantReadWriteData(lambdaFunction);

        // API Gateway REST API
        const api = new apigateway.RestApi(this, 'CoordeMeApi', {
            restApiName: 'CoordeMe API',
            description: 'API for CoordeMe Application',
            deployOptions: {
                stageName: 'Prod',
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
                metricsEnabled: true,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: [
                    'Content-Type',
                    'Authorization',
                    'X-Amz-Date',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                ],
            },
        });

        // Lambda統合
        const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction, {
            proxy: true,
        });

        // エンドポイント: GET /hello
        const helloResource = api.root.addResource('hello');
        helloResource.addMethod('GET', lambdaIntegration);

        // エンドポイント: GET /db
        const dbResource = api.root.addResource('db');
        dbResource.addMethod('GET', lambdaIntegration);

        // エンドポイント: POST /auth/login
        const authResource = api.root.addResource('auth');
        const loginResource = authResource.addResource('login');
        loginResource.addMethod('POST', lambdaIntegration);
        // OPTIONS メソッドは defaultCorsPreflightOptions で自動的に追加されます

        // 出力
        this.apiUrl = api.url;

        new cdk.CfnOutput(this, 'ApiBaseUrl', {
            value: this.apiUrl,
            description: 'API Gateway Base URL (Set this to REACT_APP_API_URL in Amplify)',
            exportName: 'CoordeMeApiBaseUrl',
        });

        new cdk.CfnOutput(this, 'AuthApiUrl', {
            value: `${this.apiUrl}auth/login`,
            description: 'API Gateway endpoint URL for authentication',
        });

        new cdk.CfnOutput(this, 'UsersTableName', {
            value: this.usersTable.tableName,
            description: 'Users DynamoDB Table Name',
            exportName: 'CoordeMeUsersTableName',
        });

        new cdk.CfnOutput(this, 'LambdaFunctionArn', {
            value: lambdaFunction.functionArn,
            description: 'Lambda Function ARN',
        });
    }
}
exports.CoordeMeBackendStack = CoordeMeBackendStack;
