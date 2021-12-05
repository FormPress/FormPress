#!/bin/bash

if [ -z "$PLUGIN_URL" ]
then
  echo "\$PLUGIN_URL is empty, skipping plugin installation"
  exit 0
fi

curl -v --header "PRIVATE-TOKEN:$PRIVATE_TOKEN" -L "$PLUGIN_URL" -o archive.zip
unzip archive -d plugin
cd plugin/*
./install.sh SKIP_WATCH
