#!/usr/bin/env bash

pushd frontend
polymer build
popd
pushd deploy
gcloud app deploy
popd
