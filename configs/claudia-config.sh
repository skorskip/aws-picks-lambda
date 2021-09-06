#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;36m'
NC='\033[0m'

helpFunction()
{
   echo ""
   echo "Usage: $0 -e environment"
   echo -e "\t-e environment to build project as"
   echo -e "\t-a action to preform 'update' OR 'create'"
   echo -e "\t-f ('update' option) file to update, none passed will update all"
   echo -e "\t-r ('create' option) aws role to use on creation"
   echo -e "\t-t ('create' option) name tag for lambda *please prepend with '-'"
   exit 1 # Exit script after printing help
}

updateAllFunction()
{
    echo -e "Updating ALL for ${BLUE}$environment${NC} ..."

    cp ./$environment/league-claudia.json ../league/claudia.json
    cd ../league
    claudia update --profile $environment
    cd ../configs
    
    cp ./$environment/messages-claudia.json ../messages/claudia.json
    cd ../messages
    claudia update --profile $environment
    cd ../configs
    
    cp ./$environment/picks-claudia.json ../picks/claudia.json
    cd ../picks
    claudia update --profile $environment
    cd ../configs
    
    cp ./$environment/users-claudia.json ../users/claudia.json
    cd ../users
    claudia update --profile $environment
    cd ../configs

    cp ./$environment/week-claudia.json ../week/claudia.json
    cd ../week
    claudia update --profile $environment
    cd ../configs
}

while getopts "a:e:t:r:f:" opt
do
   case "$opt" in
      e ) environment="$OPTARG" ;;
      a ) action="$OPTARG" ;;
      r ) role="$OPTARG" ;;
      t ) tag="$OPTARG" ;;
      f ) file="$OPTARG" ;;
      ? ) helpFunction ;; # Print helpFunction in case parameter is non-existent
   esac
done

# Print helpFunction in case parameters are empty
if [ -z "$environment" ] || [ -z "$action" ]
then
   echo "Some or all of the parameters are empty";
   helpFunction
fi

if [ $action == "update" ]; then
    
    if [ -z "$file" ]; then
        updateAllFunction
    else
        cp ./$environment/$file-claudia.json ../$file/claudia.json
        cd ../$file
        claudia update --profile $environment
    fi

elif [ $action == "create" ]; then
    
    if [ -z "$role"]; then
        echo -e "${RED}Role option not given${NC}"
    else
        echo -e "Creating for ${BLUE}$environment${NC} ..."

        mkdir $environment
    
        cd ../league
        claudia create --handler lambda.handler --deploy-proxy-api --region us-east-2 --name league$tag --role $role --profile $environment
        cp claudia.json ../configs/$environment/league-claudia.json
        cd ../configs

        cd ../messages
        claudia create --handler lambda.handler --deploy-proxy-api --region us-east-2 --name message$tag --role $role --profile $environment
        cp claudia.json ../configs/$environment/messages-claudia.json
        cd ../configs

        cd ../picks
        claudia create --handler lambda.handler --deploy-proxy-api --region us-east-2 --name picks$tag --role $role --profile $environment
        cp claudia.json ../configs/$environment/picks-claudia.json
        cd ../configs

        cd ../users
        claudia create --handler lambda.handler --deploy-proxy-api --region us-east-2 --name users$tag --role $role --profile $environment
        cp claudia.json ../configs/$environment/users-claudia.json
        cd ../configs

        cd ../week
        claudia create --handler lambda.handler --deploy-proxy-api --region us-east-2 --name week$tag --role $role --profile $environment
        cp claudia.json ../configs/$environment/week-claudia.json
        cd ../configs
    fi
else 
    echo -e "${RED}Invalid action entered - $action${NC}"
fi

rm -v ../league/claudia.json
rm -v ../messages/claudia.json
rm -v ../picks/claudia.json
rm -v ../users/claudia.json
rm -v ../week/claudia.json

echo -e "${GREEN}Process complete${NC}"
