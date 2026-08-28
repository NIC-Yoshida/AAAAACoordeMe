#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const coordeme_backend_stack_1 = require("../lib/coordeme-backend-stack");

const app = new cdk.App();

// 環境設定（デフォルトはus-east-1）
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// バックエンドスタック（Lambda + DynamoDB + API Gateway）
const backendStack = new coordeme_backend_stack_1.CoordeMeBackendStack(app, 'CoordeMeBackendStack', {
    env,
    description: 'CoordeMe Backend Infrastructure (Lambda, DynamoDB, API Gateway)',
});

// タグ付け
cdk.Tags.of(app).add('Project', 'CoordeMe');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
