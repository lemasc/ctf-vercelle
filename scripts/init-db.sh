#!/bin/sh

# Setup MySQL
mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

# Start temporary server to run initial SQL
mariadbd --user=mysql --bootstrap <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;
FLUSH PRIVILEGES;
EOF

#!/bin/sh
if [ $NODE_ENV == "production" ]; then
    # Start mariadbd in the background
    # Run prisma migrate deploy
    # Then kill the process
    mariadbd --user=mysql &
    sleep 5
    npx prisma migrate deploy
    kill -9 $(pgrep -f mariadbd)
fi
