#!/bin/sh

# clear data from the git-folder if exists
# create data/repos and data/keys if not exists

[ ! -d ${PWD}/data ] && mkdir -p ${PWD}/data
[ ! -d ${PWD}/data/repos ] && mkdir -p ${PWD}/data/repos
[ ! -d ${PWD}/data/keys ] && mkdir -p ${PWD}/data/keys

rm -f -r ${PWD}/data/repos/*
rm -f -r ${PWD}/data/keys/*


# create new ssh-key if not exists and copy it
# into the keys folder of the git server
if [ ! -f ~/.ssh/id_rsa.pub ]
then
    ssh-keygen -t rsa -f ~/.ssh/id_rsa -q -P ""
fi
cp ~/.ssh/id_rsa.pub ${PWD}/data/keys
cp ~/.ssh/id_rsa ${PWD}/data/keys
