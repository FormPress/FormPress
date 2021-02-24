#!/bin/bash
set -e

version=$(git log --pretty=format:'%h' -n 1)
PROJECT="formpress"

if [[ -n $CI_JOB_STAGE ]]; then
  echo "CI env detected, setting service account key"
  echo $GOOGLE_APPLICATION_CREDENTIALS_VALUE > /service-account-key.json
  gcloud auth activate-service-account deploy@formpress.iam.gserviceaccount.com --key-file=/service-account-key.json
fi

gcloud container clusters get-credentials primary --zone europe-west3-a --project $PROJECT

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

echo "Setting formpress/main image version to gcr.io/formpress/formpress:$version"
kubectl set image deployment/formpress main=gcr.io/formpress/formpress:$version
