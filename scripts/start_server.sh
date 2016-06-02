#!/bin/bash
docker run -e "HOME=/home" -v $HOME/.aws:/home/.aws -p 80:8080 sha.ni/webproject
