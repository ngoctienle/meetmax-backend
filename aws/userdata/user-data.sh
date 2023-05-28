#!/bin/bash

function program_is_installed {
  local return_=1

  type $1 >/dev/null 2>&1 || { local return_=0; }
  echo "$return_"
}

sudo yum update -y
sudo yum install ruby -y
sudo yum install wget -y
cd /home/ec2-user
wget https://aws-codedeploy-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/latest/install
sudo chmod +x ./install
sudo ./install auto

# Check if Node.js is installed. If not, install it
if [ $(program_is_installed node) == 0 ]; then
  curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
  sudo yum install -y nodejs
  curl -sL https://dl.yarnpkg.com/rpm/yarn.repo -o /etc/yum.repos.d/yarn.repo
  sudo yum install -y yarn
fi

if [ $(program_is_installed git) == 0 ]; then
  sudo yum install git -y
fi

if [ $(program_is_installed docker) == 0 ]; then
  sudo amazon-linux-extras install docker -y
  sudo systemctl start docker
  sudo docker run --name chatapp-redis -p 6379:6379 --restart always --detach redis
fi

if [ $(program_is_installed pm2) == 0 ]; then
  npm install -g pm2
fi

cd /home/ec2-user

git clone -b main https://github.com/ngoctienle/meetmax-backend
cd meetmax-backend
sudo yarn install
aws s3 sync s3://meetmaxapi-env-file/production .
unzip env-file.zip
cp .env.production .env
sudo yarn build
yarn start
