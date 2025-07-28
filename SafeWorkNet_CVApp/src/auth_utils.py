import os
import requests
from dotenv import load_dotenv
import sys

load_dotenv()
CHECK_API_URL = os.environ.get('CHECK_API_URL')
API_KEY = os.environ.get('API_KEY')

def validate_api_key():
    check_url = f"{CHECK_API_URL}?apiKey={API_KEY}"
    response = requests.get(check_url)
    if response.status_code == 200:
        return True
    else:
        print(f"Failed to validate API key. Status code: {response.status_code}, Response: {response.text}")
        return False

def make_request(url, method='GET', data=None, headers=None, params=None):
    if headers is None:
        headers = {}
    headers['X-API-KEY'] = API_KEY
    headers['Content-Type'] = 'application/json'

    if method == 'GET':
        response = requests.get(url, headers=headers, params=params)
    elif method == 'POST':
        response = requests.post(url, headers=headers, data=data, params=params)
    elif method == 'PATCH':
        response = requests.patch(url, headers=headers, data=data, params=params)
    elif method == 'DELETE':
        response = requests.delete(url, headers=headers, params=params)
    else:
        raise ValueError(f"Unsupported HTTP method: {method}")

    if response.status_code in [200, 201, 204]:
        if response.content:
            return response.json()
        else:
            return None
    else:
        print(f"Request to {url} failed. Status code: {response.status_code}, Response: {response.text}")
        return None
