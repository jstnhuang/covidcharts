#!/usr/bin/env bash

pushd backend
./download_raw_data.py
./process_data.py
popd
mkdir -p frontend/data
cp backend/output/* frontend/data
