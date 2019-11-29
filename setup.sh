#!/bin/sh

# Requires sudo permission

set -ex

apt-get update && apt-get upgrade
apt-get install -y python3 python3-pip python3-venv
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io
groupadd docker
usermod -aG docker vagrant