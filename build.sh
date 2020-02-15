#!/bin/bash
set -e
version=$(cat backend/package.json |jq -r '.version')

docker build -t formpress-main .
docker tag formpress-main formpress/main:$version
docker push formpress/main:$version
