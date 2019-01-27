#!/bin/sh
docker run -d -p 2222:22 -v ${PWD}/data/keys:/git-server/keys -v ${PWD}/data/repos:/git-server/repos jkarlos/git-server-docker
