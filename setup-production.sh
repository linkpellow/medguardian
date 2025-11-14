#!/bin/bash

echo "🚀 Medguardian Production Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if DATABASE_URL is provided as argument
if [ -z "$1" ]; then
    echo -e "${YELLOW}Enter your PostgreSQL connection string:${NC}"
    echo "Example: postgresql://user:password@host:5432/database?sslmode=require"
    read -p "DATABASE_URL: " DATABASE_URL
else
    DATABASE_URL=$1
fi

# Validate connection string format
if [[ ! $DATABASE_URL == postgres* ]]; then
    echo -e "${RED}❌ Invalid connection string. Must start with 'postgres' or 'postgresql'${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}📦 Step 1: Generating Prisma Client...${NC}"
export DATABASE_URL
npm run db:generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🗄️ Step 2: Running database migrations...${NC}"
npm run db:migrate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Migration failed. Check your DATABASE_URL and database permissions.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🌱 Step 3: Seeding database with initial data...${NC}"
npm run db:seed

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Seed failed, but migrations succeeded. You can seed manually later.${NC}"
else
    echo -e "${GREEN}✅ Database seeded successfully!${NC}"
fi

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Select your 'medguardian' project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add these variables:"
echo ""
echo "   DATABASE_URL = $DATABASE_URL"
echo "   NEXT_PUBLIC_APP_URL = https://medguardian-tau.vercel.app"
echo "   NODE_ENV = production"
echo ""
echo "5. Redeploy your application"
echo ""
echo -e "${GREEN}🎉 You're all set!${NC}"

