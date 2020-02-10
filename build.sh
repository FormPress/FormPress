#!/bin/bash
set -e
version=$(cat backend/package.json |jq -r '.version')

docker build -t formpress-main -f backend/Dockerfile.production .
docker tag formpress-main formpress/main:$version
docker push formpress/main:$version
