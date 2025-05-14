#!/bin/bash

echo "Building React application..."
npx webpack --mode production

if [ $? -eq 0 ]; then
  echo "React application built successfully!"
  echo "Bundle available at: static/dist/bundle.js"
else
  echo "Failed to build React application."
  exit 1
fi