#!/bin/bash
imageID=$1
alias updateImage="updateImage($1)"
alias stopImage=""
alias rmAllImages="docker rm `docker ps -aq`"
alias buildImage="docker build -t ec2-webproject-image ." 
alias runImage="docker run :"
function updatedImage(imageID) {
	docker stop imageID
	docker rmi imageID
	docker build -t "ec2-webproject-image" .
}
