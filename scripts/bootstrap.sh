#!/bin/sh

# By default www-data user owns the /var/www directory
# nginx and php-fpm run as www-data user so it can access
chown -R www-data:www-data /var/www
chmod 755 /var/www

# Set permissions for all subfolders and files to 770
find /var/www -mindepth 1 -exec chmod 770 {}

# Create site will setup any necessary users and permissions
/usr/local/bin/create-site.sh -u admin -s internalsecret