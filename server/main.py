from flask import *
import docker

imageName = "python:3.8-buster"

def create_app(test_config=None):
    client = setup()
    app = Flask(__name__)

    @app.route("/hello")
    def hello():
        output = client.containers.run(
            imageName,
            "python -c 'print(\"hello world\")'"
        ).decode("utf8")
        return output
    
    return app

def setup():
    """ Pulls the python image if it's not here and returns docker client

        imageName: A string with the name of the image

        returns: docker client
    """
    global imageName
    client = docker.from_env()
    images = client.images.list()
    hasImage = False
    for img in images:
        for tag in img.tags:
            if tag == imageName:
                hasImage = True
                break
        if hasImage:
            break
    if not hasImage:
        print("Python image not found; downloading...")
        client.images.pull(imageName)
        print("Download finished")
    return client

if __name__ == "__main__":
    main()