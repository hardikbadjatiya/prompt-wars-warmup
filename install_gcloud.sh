#!/bin/bash
set -e

echo "📦 Downloading Google Cloud SDK..."
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-467.0.0-darwin-x86_64.tar.gz

echo "📂 Extracting..."
tar -xzf google-cloud-sdk-467.0.0-darwin-x86_64.tar.gz

echo "🔧 Installing..."
./google-cloud-sdk/install.sh --quiet --path-update=false --usage-reporting=false

echo "✅ Installed to ./google-cloud-sdk"
echo ""
echo "👉 To finish setup, run these commands:"
echo ""
echo "   source ./google-cloud-sdk/path.bash.inc"
echo "   gcloud auth login"
echo "   ./deploy.sh hardik-prompt-wars us-central1"
