#!/bin/bash
# production mode
docker run -d -e "HOME=/home" -e "MODE=PRODUCTION" -v $HOME/.aws:/home/.aws -p 80:8080 sha.ni/webproject
