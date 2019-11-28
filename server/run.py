import docker
import html
import json
import tempfile
import os

from flask import (Blueprint, request)

tempDir = "/tmp"
sandboxDir = "/opt/sandbox"

def makeBlueprint(imageName, client):
    """ Defines a blueprint with the run endpoints & returns it

        imageName: String with the name of the image
        client: docker client

        return: flask blueprint
    """

    global tempDir
    global sandboxDir

    bp = Blueprint('run', __name__)

    @bp.route("/hello")
    def hello():
        output = client.containers.run(
            imageName,
            "python -c 'print(\"hello world\")'"
        ).decode("utf8").replace("\n", "<br>")
        return output

    @bp.route("/run", methods=["POST"])
    def runInDocker():
        data = request.json
        print(data)
        code = data["code"]
        if len(code) > 20:
            summary = code[0:10] + " ... " + code[-10:]
        else:
            summary = code
        summary = summary.replace("\n", "\\n")
        print(f"executing program \"{summary}\"")
        tmpdir = tempfile.mkdtemp(dir=tempDir)
        with open(os.path.join(tmpdir, "main.py"), "w+") as f:
            f.write(code)

        try:
            output = client.containers.run(
                imageName,
                f"python {sandboxDir}/main.py",
                volumes={tmpdir: {
                    "bind": sandboxDir,
                    "mount": "ro"
            }}).decode("utf8")
            output = html.escape(output)
            output = output.replace("\n", "<br>")
        except docker.errors.ContainerError as err:
            error = err.stderr.decode("utf8")
            error = html.escape(error)
            error = error.replace("\n", "<br>")
            print(f"Caught error {err}")
            return json.dumps({
                "text": f"<em>ERROR:</em> {error}",
                "status": "error",
            })
        finally:
            rmrf(tmpdir)

        return json.dumps({
            "text": output,
            "status": "success",
        })

    return bp

def rmrf(target):
    """ Removes all files within a filesystem tree

        target: Directory or file to delete
    """
    for root, dirs, files in os.walk(target, topdown=False):
        for name in files:
            os.remove(os.path.join(root, name))
        for name in dirs:
            os.rmdir(os.path.join(root, name))