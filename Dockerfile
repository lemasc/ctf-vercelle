FROM alpine:3.21 AS base

# Install Nginx, NodeJS, PHP, and Supervisor
RUN apk add --no-cache \
    sudo \
    curl \
    nodejs \
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
    # Clear existing www folder
    rm -rf /var/www;

# Setup config files
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY config/nginx/nginx.conf /etc/nginx/nginx.conf

ENV PHP_INI_DIR=/etc/php84
COPY config/php/www.conf ${PHP_INI_DIR}/php-fpm.d/www.conf
COPY config/php/php.ini ${PHP_INI_DIR}/conf.d/custom.ini

# Install mariadb
RUN set -eux; \
    apk add --no-cache mariadb mariadb-client phpmyadmin && \
    mkdir -p /run/mysqld && \
    chown -R mysql:mysql /run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql

# Set environment variables for MariaDB
ENV MYSQL_ROOT_PASSWORD=h0w!C4nUZme \
    MYSQL_DATABASE=vercelle

COPY scripts /usr/local/bin
RUN chmod +x /usr/local/bin/*.sh

# ============================================================================
# Default Site: Development stage
# ----------------------------------------------------------------------------
FROM base AS dev

# the whole /var/www should be bind-mounted
# so no need to copy anything here, just create a folder to apply permissions

# Other sites are static files, can be copy as usual

RUN mkdir -p /var/www/.force-redirect
RUN mkdir -p /var/www/internalsecret

RUN apk add --no-cache npm
RUN mkdir /var/www/default

ENV NODE_ENV=development
RUN /usr/local/bin/init-db.sh
RUN /usr/local/bin/bootstrap.sh;

EXPOSE 8080
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# ============================================================================
# Default Site: Production stage
# ----------------------------------------------------------------------------
FROM base AS nodebuild-base

RUN apk add --no-cache npm

# ---------------------------------------
FROM nodebuild-base AS nodebuild-deps

WORKDIR /app
COPY www/default/package.json www/default/package-lock.json ./
RUN npm ci

# ---------------------------------------
FROM nodebuild-base AS nodebuild
WORKDIR /app
COPY --from=nodebuild-deps /app/node_modules ./node_modules
COPY www/default .

ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build
RUN /usr/local/bin/init-db.sh

# ---------------------------------------
FROM base AS prod

ENV NODE_ENV=production
COPY --from=nodebuild /app/public /var/www/default/public
COPY --from=nodebuild /app/.next/standalone /var/www/default
COPY --from=nodebuild /app/.next/static /var/www/default/.next/static

COPY www/.force-redirect /var/www/.force-redirect
COPY www/internalsecret /var/www/internalsecret

RUN /usr/local/bin/bootstrap.sh;
EXPOSE 8080
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]