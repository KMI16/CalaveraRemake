#!/bin/bash

# configure git account
git config --global user.name  $GIT_USER_NAME
git config --global user.email $GIT_EMAIL

git config --global credential.helper '!f() { sleep 1; echo "username=${GIT_USER_NAME}\npassword=${GIT_PASSWORD}"; }; f'

git clone $GIT_REPOS_URL $HOME/Desktop/Projekt/src


