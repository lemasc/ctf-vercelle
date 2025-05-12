# syntax=docker/dockerfile:1.10
FROM alpine:3.21 AS base

RUN apk add --no-cache \
    nodejs \
    ca-certificates \
    mariadb

RUN mkdir -p /run/mysqld /var/lib/mysql; \
    chown -R mysql:mysql /var/lib/mysql; \
    chown -R mysql:mysql /run/mysqld;

# Set environment variables for MariaDB
ENV MYSQL_ROOT_PASSWORD=h0w!C4nUZme \
    MYSQL_DATABASE=vercelle

COPY --chmod=770 scripts /usr/local/bin
RUN chmod 755 /usr/local/bin/start-next.sh

# --------------------------------------
FROM base AS server

RUN apk add --no-cache \
    sudo \
    curl \
    nginx \
    php83 \
    php83-ctype \
    php83-curl \
    php83-dom \
    php83-fileinfo \
    php83-fpm \
    php83-gd \
    php83-iconv \
    php83-intl \
    php83-mbstring \
    php83-mysqli \
    php83-opcache \
    php83-openssl \
    php83-phar \
    php83-sodium \
    php83-session \
    php83-tokenizer \
    php83-xml \
    php83-xmlreader \
    php83-xmlwriter \
    phpmyadmin \
    supervisor 

# Setup www-data user and necessary permissions
RUN set -eux; \
    adduser -u 82 -D -S -G www-data www-data; \
    chown -R www-data:www-data /var/lib/nginx; \
    # Clear existing www folder
    rm -rf /var/www;

# Setup config files
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY config/nginx/nginx.conf /etc/nginx/nginx.conf

ENV PHP_INI_DIR=/etc/php83
COPY config/php/www.conf ${PHP_INI_DIR}/php-fpm.d/www.conf
COPY config/php/php.ini ${PHP_INI_DIR}/conf.d/custom.ini

COPY config/sudoers /etc/sudoers.d

# ============================================================================
# Default Site: Development stage
# ----------------------------------------------------------------------------
FROM server AS dev

# the whole /var/www should be bind-mounted
# so no need to copy anything here, just create a folder to apply permissions
WORKDIR /var/www
RUN apk add --no-cache npm

RUN mkdir default

COPY www/.force-redirect /var/www/.force-redirect
COPY www/internalsecret /var/www/internalsecret

ENV NODE_ENV=development
RUN /usr/local/bin/init-db.sh
RUN /usr/local/bin/bootstrap.sh;

EXPOSE 8080
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# ============================================================================
# Default Site: Production stage
# ----------------------------------------------------------------------------
FROM base AS nodebuild-base

RUN apk add --no-cache npm mariadb-client

# ---------------------------------------
FROM nodebuild-base AS nodebuild-deps

WORKDIR /app
COPY www/default/package.json www/default/package-lock.json ./
# https://docs.docker.com/build/cache/optimize/#use-cache-mounts
RUN --mount=type=cache,target=/root/.npm npm ci

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
FROM server AS prod

WORKDIR /var/www
ENV NODE_ENV=production
COPY --from=nodebuild --chown=www-data:www-data /app/public ./default/public
COPY --from=nodebuild --chown=www:data:www-data /app/.next/standalone ./default
COPY --from=nodebuild --chown=www-data:www-data /app/.next/static ./default/.next/static
COPY --from=nodebuild --chown=mysql:mysql /var/lib/mysql /var/lib/mysql

COPY www/.force-redirect /var/www/.force-redirect
COPY www/internalsecret /var/www/internalsecret

RUN /usr/local/bin/bootstrap.sh;
EXPOSE 8080
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]