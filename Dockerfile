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

COPY scripts /usr/local/bin
RUN chmod +x /usr/local/bin/*.sh

# Other sites are static files, can be copy as usual

COPY www/.force-redirect /var/www/.force-redirect
COPY www/internalsecret /var/www/internalsecret

# The default site is using npm, so additional build steps are required

# ============================================================================
# Default Site: Development stage
# ----------------------------------------------------------------------------
FROM base AS dev

# the whole /var/www should be bind-mounted
# so no need to copy anything here, just create a folder to apply permissions

RUN apk add --no-cache npm libc6-compat
RUN mkdir /var/www/default

RUN /usr/local/bin/bootstrap.sh;
ENV NODE_ENV=development
EXPOSE 8080
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# ============================================================================
# Default Site: Production stage
# ----------------------------------------------------------------------------
FROM alpine:3.21 AS nodebuild-base

RUN apk add --no-cache nodejs npm

# ---------------------------------------
FROM nodebuild-base AS nodebuild-deps

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY www/default/package.json www/default/package-lock.json ./
RUN npm ci

# ---------------------------------------
FROM nodebuild-base AS nodebuild
WORKDIR /app
COPY --from=nodebuild-deps /app/node_modules ./node_modules
COPY www/default .
RUN npm run build

# ---------------------------------------
FROM base AS prod

ENV NODE_ENV=production
COPY --from=nodebuild /app/public /var/www/default/public
COPY --from=nodebuild /app/.next/standalone /var/www/default
COPY --from=nodebuild /app/.next/static /var/www/default/.next/static

RUN /usr/local/bin/bootstrap.sh;
ENV NODE_ENV=production
EXPOSE 8080
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]