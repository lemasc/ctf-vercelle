#!/bin/sh

# Setup MySQL
mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

# Start temporary server to run initial SQL
sudo -u mysql /usr/bin/mariadbd --user=mysql --bootstrap <<EOF
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
    mariadbd &
    sleep 5
    npx prisma migrate deploy
    kill -9 $(pgrep -f mariadbd)
fi
