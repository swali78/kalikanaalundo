#!/bin/bash
# Apply CIRCLE schema to your Supabase Postgres instance
# Usage: ./scripts/apply-supabase-schema.sh "postgresql://postgres:YOUR_PASSWORD@db.ijvzvxbgpclslcvdspot.supabase.co:5432/postgres"

set -e

CONNECTION_STRING="${1:-$DATABASE_URL}"

if [ -z "$CONNECTION_STRING" ]; then
  echo "Error: Provide connection string as argument or set DATABASE_URL"
  echo "Example: ./scripts/apply-supabase-schema.sh 'postgresql://postgres:pass@...'"
  exit 1
fi

echo "Applying CIRCLE schema to Supabase..."
echo "Project: ijvzvxbgpclslcvdspot"

export PATH="/opt/homebrew/opt/libpq/bin:$PATH"

psql "$CONNECTION_STRING" -f supabase/migrations/20250630120000_create_circle_schema.sql

echo "✅ Schema applied successfully!"
echo ""
echo "Next steps:"
echo "1. Go to your Supabase Dashboard → Authentication → Providers"
echo "2. Enable Email + Google if desired"
echo "3. Update .env.local with your anon key"
echo "4. Restart your Next.js dev server"
