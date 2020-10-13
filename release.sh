#!/bin/bash
set -e

version=$(git log --pretty=format:'%h' -n 1)

echo $GOOGLE_APPLICATION_CREDENTIALS_VALUE > /service-account-key.json
export GOOGLE_APPLICATION_CREDENTIALS="/service-account-key.json"

gcloud container clusters get-credentials primary --zone europe-west3-a --project formpress

echo "Setting formpress/main image version to gcr.io/formpress/formpress:$version"
kubectl set image deployment/formpress main=gcr.io/formpress/formpress:$version
