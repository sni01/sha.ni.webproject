#!/bin/bash
# Check mode from environment variable
if [ "$MODE" == "PRODUCTION" ];
then
    npm run start
else
    npm run develop
fi
