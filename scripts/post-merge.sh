#!/bin/bash
set -e

# Install any new/updated packages across all workspaces
npm install

# Rebuild the shared package so server and client pick up any schema/type changes.
# Skipping this causes "does not provide an export named '...'" errors at runtime.
npm run build --workspace shared
