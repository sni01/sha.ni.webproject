#!/bin/bash
pre_containers = $(docker ps -a -q);
if [$pre_containers == "" || $pre_containers == null] exit 0
docker stop "$pre_containers";
docker rm "$pre_containers"
