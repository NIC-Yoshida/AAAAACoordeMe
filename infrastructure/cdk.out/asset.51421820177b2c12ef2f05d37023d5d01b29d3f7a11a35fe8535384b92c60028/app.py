import json
import os
import boto3
from botocore.exceptions import ClientError

CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}


def get_dynamodb_resource():
    """DynamoDBリソースを取得（ローカル環境/AWS環境に自動対応）"""
    endpoint_url = os.environ.get('DYNAMODB_ENDPOINT')
    region_name = os.environ.get('AWS_REGION', 'ap-northeast-1')

    # SAM Local環境または明示的なローカルエンドポイントが指定されている場合
    if endpoint_url or os.environ.get('AWS_SAM_LOCAL') == 'true':
        return boto3.resource(
            'dynamodb',
            endpoint_url=endpoint_url or 'http://dynamodb-local:8000',
            region_name=region_name,
            aws_access_key_id='dummy',
            aws_secret_access_key='dummy'
        )
    return boto3.resource('dynamodb', region_name=region_name)


def lambda_handler(event, context):
    """API Gateway Lambda Handler"""
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')

    # プリフライトリクエスト (OPTIONS)
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }

    try:
        # POST /auth/login: 完全一致認証
        if path == '/auth/login' and http_method == 'POST':
            body_str = event.get('body') or '{}'
            try:
                body = json.loads(body_str)
            except json.JSONDecodeError:
                return {
                    'statusCode': 400,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({'authenticated': False, 'error': '不正なJSONフォーマットです'})
                }

            username = body.get('username') or body.get('userId')
            if not username or not isinstance(username, str) or not username.strip():
                return {
                    'statusCode': 400,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({'authenticated': False, 'error': 'ユーザー名を入力してください'})
                }

            # 前後の余計な空白のみトリム（大文字小文字変換は一切行わない完全一致照合）
            target_user_id = username.strip()

            table_name = os.environ.get('USERS_TABLE_NAME', 'CoordeMeUsers')
            dynamodb = get_dynamodb_resource()
            table = dynamodb.Table(table_name)

            response = table.get_item(Key={'userId': target_user_id})

            if 'Item' in response:
                item = response['Item']
                safe_user = {
                    'userId': item.get('userId')
                }
                return {
                    'statusCode': 200,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'authenticated': True,
                        'message': 'ログイン成功',
                        'user': safe_user
                    }, ensure_ascii=False)
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'authenticated': False,
                        'message': 'ユーザー名が正しくありません'
                    }, ensure_ascii=False)
                }

        # GET /db: DBデータ確認用エンドポイント
        elif path == '/db' and http_method == 'GET':
            table_name = os.environ.get('USERS_TABLE_NAME', 'CoordeMeUsers')
            endpoint_url = os.environ.get('DYNAMODB_ENDPOINT')
            dynamodb = get_dynamodb_resource()
            client = dynamodb.meta.client
            tables = client.list_tables().get('TableNames', [])
            table = dynamodb.Table(table_name)
            items = []
            if table_name in tables:
                response = table.scan()
                items = response.get('Items', [])
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'env_table_name': table_name,
                    'endpoint_url': endpoint_url,
                    'all_tables': tables,
                    'itemCount': len(items),
                    'items': items
                }, ensure_ascii=False, default=str)
            }

        # GET /hello: ヘルスチェック
        elif path == '/hello' and http_method == 'GET':
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({'message': 'hello world'})
            }

        else:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Not Found', 'path': path, 'method': http_method})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Internal Server Error', 'detail': str(e)})
        }
