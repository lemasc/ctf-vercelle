#!/bin/sh

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
            access_log off;\\
            try_files \\\$uri =404;\\
            include fastcgi_params;\\
            fastcgi_split_path_info ^(.+\\\\.php)(/.+)\$;\\
            fastcgi_pass unix:/run/php-fpm-web-${USER}.sock;\\
            fastcgi_param SCRIPT_FILENAME \\\$request_filename;\\
            fastcgi_index index.php;\\
        }\\
    }
" /etc/nginx/http.d/${SITE}.conf
