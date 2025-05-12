# CTF-Vercelle

This project is a CTF challenge in a theme of "PHP Web Hosting". The main website will be served at `vercelle.com`
Each user's website will served on a subdomain, for example `mysite.vercelle.com`.

Structure of this project is shown below:

- **Dockerfile** : Contains building of all services (nginx, PHP, MariaDB, NodeJS) into a single container. Use for both dev and prod.
- **config/** : Contains preconfigured config files. Primarily it uses supervisord to control various web servies.
- **www/** : Contains websites pre-installed on this container.
    * **.force-redirect** : Workaround for redirecting to the correct server when deploying. Has nothing to do with the actual challenge.
    * **default** : The main website as a site manager for each user.
    * **internalsecret** : The hidden website that will be soon discovered by the attacker as a part of this challenge.
- **scripts/** will be copied to `/usr/local/bin`. Use as a part of the container and should not be concerned. 
Only these scripts are related to web hosting and is allowed for `www-data` to execute.
    * **create-site.sh** : Setup directory and configure web server to serve for the new site.
    * **reload-config.sh** : Send signal to supervisord to restart nginx and PHP. Call this to apply any web server changes.

