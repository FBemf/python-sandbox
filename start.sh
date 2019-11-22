#!/bin/sh

source venv/bin/activate
export FLASK_APP=server
export FLASK_ENV=debug
flask run