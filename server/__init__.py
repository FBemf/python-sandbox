from flask import Flask

import server.setup
import server.run

imageName = "python:3.8-buster"

def create_app(test_config=None):
    global imageName

    client = setup.dockerSetup(imageName)
    app = Flask(__name__)

    app.register_blueprint(run.makeBlueprint(imageName, client))

    return app