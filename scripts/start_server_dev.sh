#!/bin/bash
# development mode
docker run -e "HOME=/home" -e "MODE=DEVELOPMENT" -v $HOME/.aws:/home/.aws -p 80:8080 sha.ni/webproject
