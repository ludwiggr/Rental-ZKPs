#!/bin/sh
set -e

# Im Hauptverzeichnis installieren
if [ -f package.json ]; then
  npm ci
fi

# In heimdalljs installieren
if [ -f heimdalljs/package.json ]; then
  cd heimdalljs
  npm ci
  cd ..
fi

# In heimdalljs/cli installieren
if [ -f heimdalljs/cli/package.json ]; then
  cd heimdalljs/cli
  npm ci
  cd ../..
fi

# In circom/circomlib installieren
if [ -f circom/circomlib/package.json ]; then
  cd circom/circomlib
  npm ci
  cd ../../
fi