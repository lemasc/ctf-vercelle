# VerCeLLE

## Development

```sh
docker build --target dev -t ctf-vercelle:dev .
docker run -d -v "$PWD\www\default:/var/www/default" -v "vercelle-next:/var/www/default/.next" -v "vercelle-npm:/var/www/default/node_modules" -p 8080:8080 ctf-vercelle:dev
```

- Use www binding on localhost, preserve node_modules and cache on Docker volumes for best performance.
- To make typing works, on host install node v22, cd /var/www/default and npm ci. Don't run any builds there.

## Production

Install from package-lock.json only. To verify deps, use the development build.

```sh
docker build --target prod -t ctf-vercelle:prod .
docker run -d -p 8080:8080 ctf-vercelle:prod
```

## Debug Docker Container

```sg
docker run -it --entrypoint=/bin/sh ctf-vercelle:prod -i
```