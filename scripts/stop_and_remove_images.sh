#!/bin/bash
pre_containers = $(docker ps -a -q);
docker stop "$pre_containers";
docker rm "$pre_containers"
