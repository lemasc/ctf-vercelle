#!/bin/sh

# By default www-data user owns the /var/www directory
# nginx and php-fpm run as www-data user so it can access
chown -R www-data:www-data /var/www
chmod 755 /var/www

# Set permissions for all subfolders and files to 770
find /var/www -mindepth 1 -exec chmod 770 {}

# Setup MySQL
mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

# Start temporary server to run initial SQL
mariadbd --user=mysql --bootstrap <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;
FLUSH PRIVILEGES;
EOF

# Create site will setup any necessary users and permissions
USER="admin"
SITE="internalsecret"
/usr/local/bin/create-site.sh -u ${USER} -s ${SITE}

sed -i "/^}/i\\
\\
    # phpMyAdmin access at /pma\\
    location /pma {\\
        alias /usr/share/webapps/phpmyadmin/;\\
        index index.php index.html;\\
\\
        location ~ \\\.php\$ {\\
            try_files \\\$uri =404;\\
            include fastcgi_params;\\
            fastcgi_split_path_info ^(.+\\\\.php)(/.+)\$;\\
            fastcgi_pass unix:/run/php-fpm-web-${USER}.sock;\\
            fastcgi_param SCRIPT_FILENAME \\\$request_filename;\\
            fastcgi_index index.php;\\
        }\\
    }
" /etc/nginx/http.d/${SITE}.conf
