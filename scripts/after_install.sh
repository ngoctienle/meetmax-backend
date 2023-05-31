#!/bin/bash

cd /home/ec2-user/meetmax-backend
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.production
aws s3 sync s3://meetmaxapi-env-file/backend/production .
unzip env-file.zip
sudo cp .env.production .env
sudo pm2 delete all
sudo yarn install