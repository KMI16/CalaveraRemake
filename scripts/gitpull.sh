#!/bin/bash

if [ ! -d $HOME/Desktop/Projekt/src ]
then
    ssh-add Desktop/Projekt/ssh/id_rsa
fi

if [[ ! $GIT_REPOS_URL == 'ssh*' ]]
then
    # configure git account
    git config --global user.name  $GIT_USER_NAME
    git config --global user.email $GIT_EMAIL

    git config --global credential.helper '!f() { sleep 1; echo "username=${GIT_USER_NAME}\npassword=${GIT_PASSWORD}"; }; f'
fi

if [ ! -d $HOME/Desktop/Prokekt/src ]
then
    git clone $GIT_REPOS_URL $HOME/Desktop/Projekt/src
else
    git -C '$HOME/Desktop/Projekt/src' pull
fi

