#!/bin/sh

# create a new repository
# cd /data/repos
# mkdir <reposname> && cd <reposname>
# git init --shared=true
# touch README.md
# git add .
# git commit -m "Initial Commit"
# cd ..
# git clone --bare <reposname> <reposname>.git


docker run -d -p 2222:22 -v ${PWD}/data/keys:/git-server/keys -v ${PWD}/data/repos:/git-server/repos jkarlos/git-server-docker
