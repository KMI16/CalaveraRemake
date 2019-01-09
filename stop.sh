#!/bin/sh

RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

usage() 
{
    echo "\n"
    echo "This script is used to stop the server for the DevOps-Environment 'CalaveraRemake' including"
    echo "the webserver and the internal git server. ${RED}Be sure to execute this script from the root of"
    echo "your 'CalaveraRemake' installation folder.${NC}"
    echo ""
    echo "You can use this script as follows:"
    echo ""
    echo "./stop.sh"
    echo "\t-h --help"
    echo "\t--git-only"
    echo "\t--web-only"
    echo "\n"
}

stopgit() {
    echo "${BLUE}Stopping internal git-server ...${NC} "
    docker ps -a | awk '{ print $1,$2 }' | grep jkarlos/git-server-docker | awk '{print $1 }' | xargs -I {} docker stop {}
}

stopweb() {
    echo "${BLUE}Stopping web-server ... ${NC}"
    cd web/backend/
    forever stop server.js
}

checkroot() {
    if [ "$(id -u)" != "0" ]; then
        echo "${RED}This script must be run as root${NC}" 1>&2
        exit 1
    fi
}
while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`

    case $PARAM in 
        -h | --help)

            checkroot
            usage
            exit
            ;;
        --git-only)

            checkroot
            stopgit
            exit            
            ;;
        --web-only)
            stopweb
            exit
            ;;
        *)
            echo "${RED}ERROR: unknown parameter \"$PARAM\"${NC}"
            usage
            exit 1
            ;;
    esac
    shift
done

checkroot
stopgit
stopweb