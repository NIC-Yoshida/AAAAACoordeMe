import json
import pytest
from moto import mock_aws
import boto3
from hello_world import app


@pytest.fixture
def dynamodb_mock():
    """Mock DynamoDB for testing"""
    with mock_aws():
        # Create DynamoDB resource
        dynamodb = boto3.resource('dynamodb', region_name='ap-northeast-1')
        
        # Create table
        table = dynamodb.create_table(
            TableName='CoordeMeUsers',
            KeySchema=[
                {'AttributeName': 'userId', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'userId', 'AttributeType': 'S'}
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        
        # Add test data
        table.put_item(Item={'userId': 'TEST_USER'})
        table.put_item(Item={'userId': 'ADMIN'})
        
        yield table


def test_hello_endpoint():
    """Test GET /hello endpoint"""
    event = {
        'httpMethod': 'GET',
        'path': '/hello',
        'headers': {},
        'queryStringParameters': None,
        'body': None
    }
    
    response = app.lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    assert 'message' in json.loads(response['body'])
    assert json.loads(response['body'])['message'] == 'hello world'


def test_options_request():
    """Test OPTIONS request (CORS preflight)"""
    event = {
        'httpMethod': 'OPTIONS',
        'path': '/auth/login',
        'headers': {},
        'queryStringParameters': None,
        'body': None
    }
    
    response = app.lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    assert 'Access-Control-Allow-Origin' in response['headers']
    assert response['headers']['Access-Control-Allow-Origin'] == '*'


def test_login_success(dynamodb_mock, monkeypatch):
    """Test successful login"""
    # Set environment variable to use mocked DynamoDB
    monkeypatch.setenv('AWS_SAM_LOCAL', 'false')
    monkeypatch.setenv('USERS_TABLE_NAME', 'CoordeMeUsers')
    
    event = {
        'httpMethod': 'POST',
        'path': '/auth/login',
        'headers': {'Content-Type': 'application/json'},
        'queryStringParameters': None,
        'body': json.dumps({'username': 'ADMIN'})
    }
    
    response = app.lambda_handler(event, None)
    body = json.loads(response['body'])
    
    assert response['statusCode'] == 200
    assert body['authenticated'] is True
    assert body['user']['userId'] == 'ADMIN'


def test_login_failure(dynamodb_mock, monkeypatch):
    """Test login with non-existent user"""
    monkeypatch.setenv('AWS_SAM_LOCAL', 'false')
    monkeypatch.setenv('USERS_TABLE_NAME', 'CoordeMeUsers')
    
    event = {
        'httpMethod': 'POST',
        'path': '/auth/login',
        'headers': {'Content-Type': 'application/json'},
        'queryStringParameters': None,
        'body': json.dumps({'username': 'NONEXISTENT_USER'})
    }
    
    response = app.lambda_handler(event, None)
    body = json.loads(response['body'])
    
    assert response['statusCode'] == 401
    assert body['authenticated'] is False


def test_login_missing_username():
    """Test login without username"""
    event = {
        'httpMethod': 'POST',
        'path': '/auth/login',
        'headers': {'Content-Type': 'application/json'},
        'queryStringParameters': None,
        'body': json.dumps({})
    }
    
    response = app.lambda_handler(event, None)
    body = json.loads(response['body'])
    
    assert response['statusCode'] == 400
    assert body['authenticated'] is False
    assert 'error' in body


def test_login_invalid_json():
    """Test login with invalid JSON"""
    event = {
        'httpMethod': 'POST',
        'path': '/auth/login',
        'headers': {'Content-Type': 'application/json'},
        'queryStringParameters': None,
        'body': 'invalid json'
    }
    
    response = app.lambda_handler(event, None)
    body = json.loads(response['body'])
    
    assert response['statusCode'] == 400
    assert body['authenticated'] is False


def test_not_found():
    """Test 404 for unknown endpoint"""
    event = {
        'httpMethod': 'GET',
        'path': '/unknown',
        'headers': {},
        'queryStringParameters': None,
        'body': None
    }
    
    response = app.lambda_handler(event, None)
    
    assert response['statusCode'] == 404
    assert 'error' in json.loads(response['body'])
