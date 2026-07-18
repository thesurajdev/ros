#!/usr/bin/env bash
set -euo pipefail
npm install
npm run build
CLOUDWAYS_RUN=true PORT=${PORT:-3000} node dist/server.js
