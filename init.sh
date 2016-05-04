#!/bin/sh
# start server
# npm start

# /usr/src/app
alias move_to_parent = 'cd ..'
move_to_parent

alias make_aws_dir = 'mkdir aws'
make_aws_dir

alias move_to_aws = 'cd aws'
momve_to_aws

# install aws cli
curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"

apt-get update
apt-get install unzip
unzip awscli-bundle.zip
./awscli-bundle/install -b ~/bin/aws
export PATH=~/bin:$PATH 

# config aws credential
mkdir ~/.aws
touch ~/.aws/config
echo "[default]" >> ~/.aws/config
echo "output = json" >> ~/.aws/config
echo "region = us-east-1" >> ~/.aws/config

touch ~/.aws/credential
echo "[default]" >> ~/.aws/credential
echo "aws_access_key_id = AKIAJ6TGA6IWBYSX7IRA" >> ~/.aws/credential
echo "aws_secret_access_key = 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" >> ~/.aws/credential

aws configure
