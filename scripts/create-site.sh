#!/bin/sh

# Usage: create-site.sh -u USER -s SITE

while getopts ":u:s:" o; do
    case "${o}" in
        u)
            USER_IN=${OPTARG}
            ;;
        s)
            SITE=${OPTARG}
            ;;
        *)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
    esac
done

shift $((OPTIND-1))

if [ -z "$USER_IN" ] || echo "$USER_IN" | grep -q '[^a-z0-9]'; then
    echo "User not specified or invalid."
    exit 1
fi

if [ -z "${SITE}" ]; then
    SITE="${USER_IN}"
fi

# Check site name for global uniqueness
if [ -f "/etc/nginx/http.d/${SITE}.conf" ]; then
    echo "Site ${SITE} already exists."
    exit 1
fi

# Create the user with the prefix web-
# This is to avoid conflicts with system users
USER_PF="web-${USER_IN}"

# Create user and group
if ! id "$USER_PF" >/dev/null 2>&1; then
    addgroup "${USER_PF}"
    adduser -s /bin/false -D -G "${USER_PF}" "${USER_PF}"
    addgroup www-data "${USER_PF}"
fi

WWW_ROOT="/var/www/${SITE}"

mkdir -p "${WWW_ROOT}/public_html"

# Create a simple index.html file if not exists
if [ ! -f "${WWW_ROOT}/public_html/index.html" ] && [ ! -f "${WWW_ROOT}/public_html/index.php" ]; then
    cat <<EOL > "${WWW_ROOT}/public_html/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${SITE}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
        }
        h1 {
            color: #333;
        }
        p {
            font-size: 18px;
        }
    </style>
</head>
<body>
    <h1>Welcome to ${SITE}</h1>
    <p>This is a simple web page created by ${USER_IN}.</p>
    <p>Feel free to customize it!</p>
    <hr>
    <p>Hosted on <strong>Vercelle</strong></p>
</body>
</html>
EOL
fi

chown -R "${USER_PF}:${USER_PF}" "${WWW_ROOT}"
chmod -R 770 "${WWW_ROOT}"

# Create nginx config for the site

# etag to allow changes to visble easily
# add x-powered-by header to show PHP version, inientionally leave as a hint
# nginx handle static files directly, but we intentionally want to expose header as a hint
cat <<EOL > /etc/nginx/http.d/${SITE}.conf
server {
    listen 8080;
    server_name ~^${SITE}.vercelle-*(([0-9a-z\-.]*)+).((nip.io)|(traefik.me))$;

    root ${WWW_ROOT}/public_html;
    index index.php index.html;
    add_header X-Powered-By "PHP/8.3.19" always;

    location / {
        try_files \$uri \$uri/ /index.php\$is_args\$args =404;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
            root /var/lib/nginx/html;
    }

    location ~ \.php$ {
        try_files \$uri =404;
        include fastcgi_params;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/run/php-fpm-${USER_PF}.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_index index.php;
    }
}
EOL

# Create PHP-FPM pool only if not exist
PHP_POOL_CONF="/etc/php83/php-fpm.d/${USER_PF}.conf"
if [ ! -f "$PHP_POOL_CONF" ]; then
cat <<EOL > "$PHP_POOL_CONF"
[${USER_PF}]
user = ${USER_PF}
group = ${USER_PF}
listen = /run/php-fpm-${USER_PF}.sock
listen.owner = www-data
listen.group = ${USER_PF}
pm = ondemand
pm.max_children = 10
pm.process_idle_timeout = 10s;
pm.max_requests = 100
clear_env = no
catch_workers_output = yes
decorate_workers_output = no
EOL
fi