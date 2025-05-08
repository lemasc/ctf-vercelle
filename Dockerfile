FROM alpine:3.21

# Install Nginx, PHP, and Supervisor
RUN apk add --no-cache \
    sudo \
    curl \
    nginx \
    php84 \
    php84-ctype \
    php84-curl \
    php84-dom \
    php84-fileinfo \
    php84-fpm \
    php84-gd \
    php84-iconv \
    php84-intl \
    php84-mbstring \
    php84-mysqli \
    php84-opcache \
    php84-openssl \
    php84-phar \
    php84-sodium \
    php84-session \
    php84-tokenizer \
    php84-xml \
    php84-xmlreader \
    php84-xmlwriter \
    supervisor

# Link PHP 8.4 to the default PHP command
RUN ln -s /usr/bin/php84 /usr/bin/php

# Setup www-data user and necessary permissions
RUN set -eux; \
    adduser -u 82 -D -S -G www-data www-data; \
    chown -R www-data:www-data /var/lib/nginx; \
    chown -R www-data:www-data /var/www;

# Setup config files
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY config/nginx/nginx.conf /etc/nginx/nginx.conf

ENV PHP_INI_DIR /etc/php84
COPY config/php/www.conf ${PHP_INI_DIR}/php-fpm.d/www.conf
COPY config/php/php.ini ${PHP_INI_DIR}/conf.d/custom.ini

COPY www /var/www

EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]