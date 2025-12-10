#!/usr/bin/env bash

DIR=${1:-$(pwd)}
cd "$DIR" || exit 1

echo "Running Nginx on http://localhost:8080/ with root directory: $(pwd)"
docker run --name "nginx" -d --rm -p 8080:80 -v "$(pwd):/usr/share/nginx/html:ro" nginx