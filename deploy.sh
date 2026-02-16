#!/bin/bash
set -e

# Default values
PROJECT_ID=${1:-hardik-prompt-wars}
REGION=${2:-us-central1}
SERVICE_NAME="area-control-loop"

echo "🚀 Deploying Area Control Loop to Cloud Run..."
echo "Using Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Ensure gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed."
    echo "   Please install it: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Authenticate if needed
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "🔑 Authenticating..."
    gcloud auth login
fi

# Set project
gcloud config set project "$PROJECT_ID"

# Enable required services
echo "📦 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com

# Get env vars from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️ Warning: .env file not found. Using default/empty env vars."
fi

# Build and Deploy
echo "🔨 Building container image..."
gcloud builds submit --tag gcr.io/"$PROJECT_ID"/"$SERVICE_NAME" \
  --substitutions="_VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY},_VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN},_VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID},_VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET},_VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID},_VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID},_VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY},_VITE_API_URL=${VITE_API_URL}"

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image gcr.io/"$PROJECT_ID"/"$SERVICE_NAME" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}" \
  --set-env-vars "FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}" \
  --set-env-vars "CORS_ORIGIN=${CORS_ORIGIN}" \
  --port 8080

echo "✅ App deployed successfully!"
echo "   URL: $(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)')"
