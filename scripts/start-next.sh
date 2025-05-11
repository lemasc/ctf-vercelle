#!/bin/sh

cd /var/www/default

if [ $NODE_ENV == "production" ]; then
    PORT=9000 HOSTNAME='127.0.0.1' node server.js 
else
    # we probably have a volume mounted on devlopment
    # make sure we have the latest and updated dependencies
    echo "Next.js is starting. Ensuring installed dependencies..."
    npm install
    npx prisma migrate dev
    PORT=9000 npm run dev
fi