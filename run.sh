#!/bin/sh

docker run -d -p 5901:5901 -p 6901:6901 -e VNC_RESOLUTION=1366x768 -e GIT_REPOS_URL=https://github.com/KMI16/Test.git -e GIT_USER_NAME=KMI16 -e GIT_PASSWORD=passwordkmi16 swe-devops
