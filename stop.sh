#!/bin/sh

# color constants for colorized output
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color


####
# Method that prints the usage instructions to the console.
#####
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

####
# Method that stops the git server only
# In order to do that it greps all running docker container
# from the image jkarlos/git-server-docker and stops them
####
stopgit() {
    echo "${BLUE}Stopping internal git-server ...${NC} "
    docker ps -a | awk '{ print $1,$2 }' | grep jkarlos/git-server-docker | awk '{print $1 }' | xargs -I {} docker stop {}
}

####
# Method that stops the web server only
####
stopweb() {
    echo "${BLUE}Stopping web-server ... ${NC}"
    cd web/backend/
    forever stop server.js
}

####
# Method that checks whether the current user is root or not
# If not an error will be printed to the console
####
checkroot() {
    if [ "$(id -u)" != "0" ]; then
        echo "${RED}This script must be run as root${NC}" 1>&2
        exit 1
    fi
}


# loop through each command line argument passed into the script
# and parse it. PARAM contains the actual dashed-prefixed command
# and VALUE the actual value after the command.
# If an unknown command is provided, an error will be printed to the console
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