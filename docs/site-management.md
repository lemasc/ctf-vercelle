# FEATURE: Site Management

The site management feature is served as a main website at `vercelle.com`, located in the `www/default` folder. This is the first feature users will interact.

This site is written in Next.js, using Prisma and MariaDB for database.

## Managing sites

The site management is done completely on the local file system, with permissions are separated from each user. For example:

- `sitea.vercelle.com` will have files located at `/var/www/sitea` with sitea:sitea as the owner.
- `siteb.vercelle.com` will have files located at `/var/www/siteb` with siteb:siteb as the owner.

As such, to perform checks whether the current user has access or not, simple list the directory as a user. If it fails with permission denied, then the user didn't have access.

```sh
sudo -u sitea ls /var/www/siteb     # will fail!
```

However, listing all sites under the `/var/www` will be allowed, and thus is leaking the `internalsecret` site, which will be continue in finding the next flag of this challenge.

## Setup a new site

To create a new site. You must call this script with root permissions.

```sh
sudo create-site.sh -u [USER] -s [SITE]
```

The site parameter is optional. If omitted, it will be default to the user's name. This is used to create a default site when user is registering an account for the first time.

## Managing files in the site

Each files in the `/var/www/[site]/public_html` will be served by nginx, and it intentionally allows running PHP scripts too. (Hinted by the X-Powered-By header.) Users can upload, download, and delete the files as their will, but make sure to perform all operations under the correct user.

## Getting the first flag

By uploading the PHP file and gained RCE, the first flag is located at `/var/www/1st_flag.txt`