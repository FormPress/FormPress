#!/bin/bash
set -e

version=$(git log --pretty=format:'%h' -n 1)
PROJECT="formpress"
CLUSTER=$1
ZONE=$2
DEPLOYMENT=$3
IMAGESUFFIX=$4

if [[ -n $CI_JOB_STAGE ]]; then
  echo "CI env detected, setting service account key"
  echo $GOOGLE_APPLICATION_CREDENTIALS_VALUE > /tmp/service-account-key.json
  gcloud auth activate-service-account deploy@formpress.iam.gserviceaccount.com --key-file=/tmp/service-account-key.json
fi

gcloud container clusters get-credentials $CLUSTER --zone $ZONE --project $PROJECT

n=0
until [ "$n" -ge 20 ]
do
  STATUS=$(gcloud builds list --project=$PROJECT| grep -m 1 $version| awk '{print $6}')

  if [[ $STATUS == 'SUCCESS' ]]; then
    echo "(Attempt#$n)Build completed! Setting new image"
    break
  else
    echo "(Attempt#$n)Build status is $STATUS. Retry in 15 seconds."
  fi

  n=$((n+1))
  sleep 15
done

echo "Setting formpress/formpress image version to gcr.io/formpress/formpress${IMAGESUFFIX}:$version"
kubectl set image deployment/$3 formpress=gcr.io/formpress/formpress$IMAGESUFFIX:$version
