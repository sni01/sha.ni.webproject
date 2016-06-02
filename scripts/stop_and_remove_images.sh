#!/bin/bash
pre_containers=$(docker ps -a -q);
if [ -z "$pre_containers" ]
then exit 0
else
    docker stop "$pre_containers"
    docker rm "$pre_containers"
fi
