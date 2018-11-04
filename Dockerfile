FROM consol/ubuntu-xfce-vnc:1.2.0

USER root

# Environment Variables
ENV GIT_REPOS_URL=yourgitrepos@github.com \
    GIT_USER_NAME=yourigtname \
    GIT_PASSWORD=yourgitpw \
    GIT_EMAIL=yourgitemail@web.de

# Add git script and give permission
ADD scripts/gitpull.sh Desktop/Projekt/scripts/gitpull.sh
#RUN chmod +x Desktop/Projekt/scripts/gitpull.sh

# Add git push script and give permission
ADD scripts/gitpush.sh Desktop/Projekt/scripts/gitpush.sh
#RUN chmod +x Desktop/Projekt/scripts/gitpush.sh

RUN chmod -R +x Desktop/Projekt/scripts/*

# add both scripts to path so it can be excuted everywhere
ENV PATH="${HOME}/Desktop/Projekt/scripts/:${PATH}"

RUN apt-get update
RUN apt-get install -y software-properties-common

# add and install unzip zip
RUN apt-get install zip unzip

# install nano
RUN apt-get install nano

# add netbeans repository in order to install
RUN add-apt-repository ppa:vajdics/netbeans-installer && apt-get update

# install default jdk and netbeans
RUN apt-get install -y default-jdk
RUN apt-get install -y netbeans-installer

# create netbeans shortcut icon
RUN ln -s $(which netbeans) Desktop

# install git
RUN apt-get install -y git

# Run the gitsript
#RUN crontab -l | { cat; echo "@reboot ./Desktop/Projekt/scripts/gitscript.sh"; } | crontab -
#RUN ./Desktop/Projekt/scripts/gitscript.sh

