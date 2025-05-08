#!/bin/sh

# Usage: create-site.sh -u USER -s SITE

while getopts ":u:s:" o; do
    case "${o}" in
        u)
            USER=${OPTARG}
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

if [ -z "$USER" ] || echo "$USER" | grep -q '[^a-z0-9]'; then
    echo "User not specified or invalid."
    exit 1
fi

if [ -z "${SITE}" ]; then
    SITE="${USER}"
fi

# Create the user with the prefix web-
# This is to avoid conflicts with system users
USER_PF="web-${USER}"

# Create user and group
if id "${USER_PF}" &>/dev/null; then
    echo "User ${USER_} already exists"
    exit 1
fi

if getent group "${USER_PF}" > /dev/null; then
    echo "User ${USER} already exists"
    exit 1
fi

# The group name is the same as the user name
addgroup "${USER_PF}"
adduser -s /bin/false -D -G "${USER_PF}" "${USER_PF}"

# Add www-data user to the user group
addgroup www-data "${USER_PF}"

WWW_ROOT="/var/www/${USER_PF}"

mkdir -p "${WWW_ROOT}/public_html"

# Create a simple index.html file if the index.html or index.php file does not exist
if [ ! -f "${WWW_ROOT}/public_html/index.html" ] && [ ! -f "${WWW_ROOT}/public_html/index.php" ]; then
    cat <<EOL > "${WWW_ROOT}/public_html/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${USER}</title>
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
    <h1>Welcome to ${USER}</h1>
    <p>This is a simple web page for ${USER}.</p>
    <p>Feel free to customize it!</p>
    <hr>
    <p>Hosted on <strong>Vercelle</strong></p>
</body>
</html>
EOL
fi

chown -R "${USER_PF}:${USER_PF}" "${WWW_ROOT}"
chmod -R 750 "${WWW_ROOT}"

# Create nginx config
cat <<EOL > /etc/nginx/http.d/${SITE}.conf
server {
    listen 8080;
    server_name ~^${SITE}.vercelle-*(([0-9a-z\-.]*)+).((nip.io)|(traefik.me))$;

    root ${WWW_ROOT}/public_html;
    index index.php index.html;

    location / {
        try_files \$uri \$uri/ /index.php\$is_args\$args =404;
    }

    # Redirect server error pages to the static page /50x.html
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

cat <<EOL > $PHP_INI_DIR/php-fpm.d/${USER_PF}.conf
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