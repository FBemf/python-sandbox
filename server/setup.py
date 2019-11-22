import docker

def dockerSetup(imageName):
    """ Pulls the python image if it's not here and returns docker client

        imageName: A string with the name of the image

        returns: docker client
    """
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