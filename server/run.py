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
        """ A simple hello-world to make sure docker's running.
        """
        output = client.containers.run(
            imageName,
            "python -c 'print(\"hello world\")'"
        ).decode("utf8").replace("\n", "<br>")
        return output

    @bp.route("/run", methods=["POST"])
    def runInDocker():
        """ Run a given python script in a dockerized python environment.

            Takes as input a json with a "code" field holding the code.
        """

        # Log code
        data = request.json
        print(data)
        code = data["code"]
        print(f"executing program \"{summarize(code)}\"")

        # Write code into temp file
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
        except docker.errors.ContainerError as err:
            error = err.stderr.decode("utf8")
            print(f"Caught error {err}")
            return json.dumps({
                "text": escapeOutput(error),
                "status": "error",
            })
        finally:
            rmrf(tmpdir)

        return json.dumps({
            "text": escapeOutput(output),
            "status": "success",
        })

    return bp

def escapeOutput(output):
    """ Escapes result text in such a way
        as to make it display nicely and safely.
    """
    output = html.escape(output)
    output = output.replace(" ", "&nbsp;")
    output = output.replace("\n", "<br>")
    return output

def summarize(text):
    """ Summarizes some text
    """
    if len(text) > 20:
        summary = text[0:10] + " ... " + text[-10:]
    else:
        summary = text
    summary = summary.replace("\n", "\\n")
    return summary

def rmrf(target):
    """ Removes all files within a filesystem tree

        target: Directory or file to delete
    """
    for root, dirs, files in os.walk(target, topdown=False):
        for name in files:
            os.remove(os.path.join(root, name))
        for name in dirs:
            os.rmdir(os.path.join(root, name))