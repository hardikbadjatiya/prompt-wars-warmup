#!/bin/bash
set -e

PROJECT_ID="hardik-prompt-wars"
REGION="us-central1"
SERVICE_NAME="area-control-loop"

echo "🔧 Fixing permissions for public access..."

gcloud run services add-iam-policy-binding "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --member="allUsers" \
  --role="roles/run.invoker"

echo "✅ Permissions updated: Service is now publicly accessible."
