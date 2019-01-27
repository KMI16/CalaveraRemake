#!/bin/sh

# name of the ssh key to be generated in order
# to connect to the git server over ssh
SSH_KEY_NAME="id_calavera_git_server"

# color constants for colorized output
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo "${PURPLE}Setting up git-server${NC}"
echo "${PURPLE}Creating necessary folders....${NC}"

# clear data from the git-folder if exists
# create data/repos and data/keys if not exists
[ ! -d ${PWD}/data ] && mkdir -p ${PWD}/data
[ ! -d ${PWD}/data/repos ] && mkdir -p ${PWD}/data/repos
[ ! -d ${PWD}/data/keys ] && mkdir -p ${PWD}/data/keys

echo "${PURPLE}Deleting existing keys${NC}"
rm -f -r ${PWD}/data/keys/*

# create new ssh-key if not exists
if [ ! -f ~/.ssh/${SSH_KEY_NAME}.pub ]
then
    echo "${PURPLE}Creating ssh key...${NC}"
    ssh-keygen -t rsa -f ~/.ssh/${SSH_KEY_NAME} -C "KMI16@byom.de" -q -P ""
fi

echo "${PURPLE}Copy ssh key...${NC}"

# copy it into the keys folder of the git server
cp ~/.ssh/${SSH_KEY_NAME}.pub ${PWD}/data/keys
cp ~/.ssh/${SSH_KEY_NAME} ${PWD}/data/keys
