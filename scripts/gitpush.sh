#!/bin/bash


if [ $# -eq 1 ]
then
    git -C $HOME/Desktop/Projekt/src add .
    git -C $HOME/Desktop/Projekt/src commit -m "$1"
    git -C $HOME/Desktop/Projekt/src push origin master	
else
    echo "Wrong number of arguments. Syntax: ./gitpush.sh <message>"
fi
