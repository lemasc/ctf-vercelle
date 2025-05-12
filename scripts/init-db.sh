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
    # Wait for MariaDB to be ready
    for i in $(seq 1 30); do
        if mariadb-admin ping -h localhost -u root -p"${MYSQL_ROOT_PASSWORD}" --silent; then
            break
        fi
        sleep 1
    done
    npx prisma migrate deploy
    npx prisma db seed
    kill -s SIGTERM $(pgrep -f mariadbd)
fi
