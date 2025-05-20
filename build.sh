#!/bin/bash
# exit on error
set -o errexit

# Create necessary directories
mkdir -p models
mkdir -p templates/uploads
mkdir -p static/images/event_managers

# Download face detection model
echo "Downloading face detection model..."
curl -L "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip" -o buffalo_l.zip
unzip buffalo_l.zip -d models/
rm buffalo_l.zip

# Download face swap model if not exists
if [ ! -f "models/inswapper_128.onnx" ]; then
    echo "Downloading face swap model..."
    curl -L "https://github.com/deepinsight/insightface/releases/download/v0.7/inswapper_128.onnx" -o models/inswapper_128.onnx
fi

# Install Python dependencies
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Install Node.js dependencies and build frontend
npm install
npx webpack --mode production

echo "Build completed successfully!" 