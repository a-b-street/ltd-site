#!/bin/bash

set -e
rm -rf output
node generate.js
cd output
python3 -m http.server
