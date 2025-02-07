import pytest
from app.app import create_app, mongo
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash

@pytest.fixture
def app():
    app = create_app()
    app.config["TESTING"] = True
    app.config["MONGO_URI"] = "mongodb://localhost:27017/grant_db"
    with app.app_context():
        mongo.cx.drop_database("test_grant_db")
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

def test_login(client):
    response = client.post('/auth/login', json={'username': 'test', 'password': 'test'})
    assert response.status_code == 401

    hashed_password = generate_password_hash('test')
    mongo.db.users.insert_one({'username': 'test', 'password': hashed_password})

    response = client.post('/auth/login', json={'username': 'test', 'password': 'test'})
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_protected(client):
    access_token = create_access_token(identity={'username': 'test'})
    headers = {'Authorization': f'Bearer {access_token}'}
    response = client.get('/auth/protected', headers=headers)
    assert response.status_code == 200
    assert response.json['logged_in_as']['username'] == 'test'
