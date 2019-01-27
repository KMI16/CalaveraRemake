#!/bin/sh

# color constants for colorized output
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CLEAR='\033[0m' # No Color

# default configuration values
PORT=4200
HOST="localhost"

####
# Method that prints the usage instructions to the console.
#####
usage() 
{
    echo "\n"
    echo "This script is used to start and configure the server for the DevOps-Environment 'CalaveraRemake'."
    echo "${RED}Make sure to run this script as a root user.${CLEAR}"
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

# loop through each command line argument passed into the script
# and parse it. PARAM contains the actual dashed-prefixed command
# and VALUE the actual value after the command.
# If an unknown command is provided, an error will be printed to the console
while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`

    case $PARAM in 
        -h | --help)
            usage
            exit
            ;;
        --host)
            HOST=$VALUE
            ;;
        --port)
            PORT=$VALUE
            ;;
        *)
            echo "${RED}ERROR: unknown parameter \"$PARAM\"${CLEAR}"
            usage
            exit 1
            ;;
    esac
    shift
done

# check whether the current user has root permissions
# print error if not
if [ "$(id -u)" != "0" ]; then
   echo "${RED}This script must be run as root${CLEAR}" 1>&2
   exit 1
fi


# execute scripts to setup and run the git-server
echo "${BLUE}Starting the git server...${CLEAR}"
git-server/server-setup.sh
git-server/run.sh
echo ""

# intall node module forever in order to start
# the webserver as a background service
echo "${BLUE}Starting webserver...${CLEAR}"
cd web/backend/
npm install -g forever
forever start server.js

echo ""
echo "${PURPLE}Finished setting up the environment."
echo "Your webserver is running on ${BLUE}http://localhost:${PORT}${CLEAR}"

