#!/bin/bash

DIT="/home/ec2-user/meetmax-backend"
if [ -d "$DIR" ]; then
  cd /home/ec2-user
  sudo rm -rf meetmax-backend
else
  echo "Directory does not exist"
fi