#!/bin/bash

# if the repos url is an ssh connection url and the script is called for the first
# time, add the copied ssh key to the ssh-agent
# the script is 'called the first time' when the src folder does not exist
if [ "${GIT_REPOS_URL:0:3}" = 'ssh' ] && [ ! -d $HOME/Desktop/Projekt/src ]
then
    ssh-add $HOME/Desktop/Projekt/ssh/id_calavera_git_server
fi

# configure git account
git config --global user.name  $GIT_USER_NAME
git config --global user.email $GIT_EMAIL

if [ ! "${GIT_REPOS_URL:0:3}" = 'ssh' ]
then
    # add credential.helper in order to avoid password/username input
    # only do that if its no ssh 
    git config --global credential.helper '!f() { sleep 1; echo "username=${GIT_USER_NAME}\npassword=${GIT_PASSWORD}"; }; f'
fi


# if the script is called for the first time clone the project
# otherwise pull in order to update
if [ ! -d $HOME/Desktop/Projekt/src ]
then
    git clone $GIT_REPOS_URL $HOME/Desktop/Projekt/src
else
    git -C $HOME/Desktop/Projekt/src pull
fi
