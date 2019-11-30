#!/bin/bash

cd /root/python-sandbox/
source venv/bin/activate
gunicorn "server:create_app()"
