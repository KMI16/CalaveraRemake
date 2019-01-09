#!/bin/sh

RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

PORT=4200

usage() 
{
    echo "\n"
    echo "This script is used to start and configure the server for the DevOps-Environment 'CalaveraRemake'."
    echo "${RED}Make sure to run this script as a root user.${NC}"
    echo ""
    echo "You can use this script as follows:"
    echo ""
    echo "./startup.sh"
    echo "\t-h --help"
    echo "\t--port=$PORT"
    echo "\t--host=$HOST"
    echo ""
    echo "The default settings for the webserver are port=$PORT. If you change these settings you need to modify the"
    echo "web/backend/www/js/request.js script as well and adjust the basicURL. Otherwise the application won't work."
    echo "\n"
}

while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`

    case $PARAM in 
        -h | --help)
            usage
            exit
            ;;
        --port)
            PORT=$VALUE
            ;;
        *)
            echo "${RED}ERROR: unknown parameter \"$PARAM\"${NC}"
            usage
            exit 1
            ;;
    esac
    shift
done

if [ "$(id -u)" != "0" ]; then
   echo "${RED}This script must be run as root${NC}" 1>&2
   exit 1
fi

# start the git server
echo "${BLUE}Starting the git server...${NC}"
git-server/server-setup.sh
git-server/run.sh
echo ""

# starting the webserver
echo "${BLUE}Starting webserver...${NC}"
cd web/backend/
npm install -g forever
forever start server.js

echo ""
echo "${PURPLE}Finished setting up the environment."
echo "Your webserver is running on ${BLUE}http://localhost:${PORT}${NC}"

