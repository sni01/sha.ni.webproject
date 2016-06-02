#!/bin/bash
pre_containers=$(docker ps -a -q)
if [ -n $pre_containers ]
    docker stop $pre_containers
    docker rm $pre_containers
fi
