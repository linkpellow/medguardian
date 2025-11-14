#!/bin/bash

# Interactive Production Setup Script
# This will guide you through the entire setup process

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Medguardian Production Setup        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Database Provider Selection
echo -e "${YELLOW}Step 1: Choose your database provider${NC}"
echo ""
echo "1) Vercel Postgres (Recommended - Easiest)"
echo "2) Supabase (Free tier available)"
echo "3) Neon (Serverless Postgres)"
echo "4) I already have a connection string"
echo ""
read -p "Enter choice (1-4): " db_choice

case $db_choice in
    1)
        echo ""
        echo -e "${BLUE}📋 Vercel Postgres Setup:${NC}"
        echo "1. Go to: https://vercel.com/dashboard"
        echo "2. Select your 'medguardian' project"
        echo "3. Click 'Storage' tab"
        echo "4. Click 'Create Database' → 'Postgres'"
        echo "5. Name it and create"
        echo "6. Copy the connection string"
        echo ""
        ;;
    2)
        echo ""
        echo -e "${BLUE}📋 Supabase Setup:${NC}"
        echo "1. Go to: https://supabase.com/dashboard"
        echo "2. Click 'New Project'"
        echo "3. Name: medguardian"
        echo "4. Set database password (save it!)"
        echo "5. Wait ~2 minutes for setup"
        echo "6. Go to Settings → Database"
        echo "7. Copy Connection string (URI)"
        echo ""
        ;;
    3)
        echo ""
        echo -e "${BLUE}📋 Neon Setup:${NC}"
        echo "1. Go to: https://console.neon.tech"
        echo "2. Click 'Create a project'"
        echo "3. Name: medguardian"
        echo "4. Copy connection string from dashboard"
        echo ""
        ;;
    4)
        echo ""
        echo -e "${GREEN}Great! You already have a connection string.${NC}"
        echo ""
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Step 2: Get Connection String
echo -e "${YELLOW}Step 2: Database Connection String${NC}"
echo ""
read -p "Paste your DATABASE_URL here: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Connection string is required!${NC}"
    exit 1
fi

# Validate format
if [[ ! $DATABASE_URL == postgres* ]]; then
    echo -e "${RED}❌ Invalid format. Must start with 'postgres' or 'postgresql'${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Connection string received!${NC}"
echo ""

# Step 3: Test Connection
echo -e "${YELLOW}Step 3: Testing database connection...${NC}"
export DATABASE_URL

# Test with Prisma
echo "Testing connection..."
npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Connection successful!${NC}"
else
    echo -e "${YELLOW}⚠️  Connection test skipped (may require database to exist)${NC}"
fi

echo ""

# Step 4: Generate Prisma Client
echo -e "${YELLOW}Step 4: Generating Prisma Client...${NC}"
npm run db:generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prisma Client generated!${NC}"
echo ""

# Step 5: Run Migrations
echo -e "${YELLOW}Step 5: Running database migrations...${NC}"
npm run db:migrate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Migration failed!${NC}"
    echo "Check your DATABASE_URL and database permissions."
    exit 1
fi

echo -e "${GREEN}✅ Migrations completed!${NC}"
echo ""

# Step 6: Seed Database
echo -e "${YELLOW}Step 6: Seeding database with initial data...${NC}"
npm run db:seed

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Seed failed, but migrations succeeded. You can seed manually later.${NC}"
else
    echo -e "${GREEN}✅ Database seeded successfully!${NC}"
    echo ""
    echo -e "${GREEN}📝 Default login credentials:${NC}"
    echo "   Admin: admin@meduardian.net / password123"
    echo "   Agent: john.smith@insurance.com / password123"
fi

echo ""

# Step 7: Vercel Environment Variables
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Next: Configure Vercel              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Step 7: Add environment variables to Vercel${NC}"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your 'medguardian' project"
echo "3. Go to: Settings → Environment Variables"
echo "4. Add these 3 variables:"
echo ""
echo -e "${GREEN}Variable 1:${NC}"
echo "   Key: DATABASE_URL"
echo "   Value: $DATABASE_URL"
echo "   Environment: Production"
echo ""
echo -e "${GREEN}Variable 2:${NC}"
echo "   Key: NEXT_PUBLIC_APP_URL"
echo "   Value: https://medguardian-tau.vercel.app"
echo "   Environment: Production"
echo ""
echo -e "${GREEN}Variable 3:${NC}"
echo "   Key: NODE_ENV"
echo "   Value: production"
echo "   Environment: Production"
echo ""
echo "5. Click 'Save' on each variable"
echo "6. Go to 'Deployments' tab"
echo "7. Click '⋯' on latest deployment → 'Redeploy'"
echo ""

# Save connection string for reference
echo "$DATABASE_URL" > .database-url.txt
echo -e "${GREEN}✅ Connection string saved to .database-url.txt (for reference)${NC}"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Database Setup Complete!          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Next: Add environment variables to Vercel and redeploy!"
echo ""

