# Vercel Production Setup Guide

## Step 1: Set Up Production Database

### Option A: Vercel Postgres (Recommended - Easiest)

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your `medguardian` project
3. Go to **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Choose a name (e.g., `medguardian-db`)
6. Select a region (choose closest to your users)
7. Click **Create**
8. Vercel will automatically add the `POSTGRES_URL` environment variable

**Connection String Format:**
```
postgres://default:[password]@[host]:5432/verceldb?sslmode=require
```

### Option B: Supabase (Free Tier Available)

1. Go to https://supabase.com
2. Sign up / Log in
3. Click **New Project**
4. Fill in:
   - Name: `medguardian`
   - Database Password: (save this!)
   - Region: Choose closest
5. Wait for project to be created (~2 minutes)
6. Go to **Settings** → **Database**
7. Copy the **Connection String** (URI format)

**Connection String Format:**
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Option C: Neon (Serverless Postgres)

1. Go to https://neon.tech
2. Sign up / Log in
3. Click **Create Project**
4. Name: `medguardian`
5. Copy the connection string from the dashboard

**Connection String Format:**
```
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

### Option D: Railway

1. Go to https://railway.app
2. Sign up / Log in
3. Click **New Project** → **Provision PostgreSQL**
4. Copy the connection string from the **Variables** tab

---

## Step 2: Run Database Migrations

After you have your database connection string, run:

```bash
# Set your DATABASE_URL
export DATABASE_URL="your-connection-string-here"

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

**Or use Prisma Studio to verify:**
```bash
npm run db:studio
```

---

## Step 3: Configure Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select `medguardian` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | `https://medguardian-tau.vercel.app` | Your Vercel deployment URL |
| `NODE_ENV` | `production` | Environment mode |

### Optional Variables (Add Later)

| Variable | Value | Description |
|----------|-------|-------------|
| `TELNYX_API_KEY` | `your-key` | For SMS notifications |
| `TELNYX_PHONE_NUMBER` | `+1234567890` | Telnyx phone number |
| `RESEND_API_KEY` | `your-key` | For email notifications |
| `EMAIL_FROM` | `noreply@yourdomain.com` | Email sender address |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics ID |
| `SENTRY_DSN` | `your-dsn` | Error monitoring |

### Adding Variables in Vercel

1. Click **Add New**
2. Enter the **Key** (e.g., `DATABASE_URL`)
3. Enter the **Value** (your connection string)
4. Select **Environment**: Production, Preview, Development (or all)
5. Click **Save**

---

## Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

---

## Step 5: Verify Deployment

1. Visit: https://medguardian-tau.vercel.app
2. Test the form: `/form?agentId={agent-id}`
3. Check admin panel: `/admin` (login required)
4. Verify database connection in logs

---

## Quick Setup Script

Save this as `setup-production.sh`:

```bash
#!/bin/bash

echo "🚀 Setting up production database..."

# Prompt for database URL
read -p "Enter your DATABASE_URL: " DATABASE_URL

# Set environment variable
export DATABASE_URL

echo "📦 Generating Prisma Client..."
npm run db:generate

echo "🗄️ Running migrations..."
npm run db:migrate

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Add DATABASE_URL to Vercel environment variables"
echo "2. Add NEXT_PUBLIC_APP_URL to Vercel"
echo "3. Redeploy your application"
```

---

## Troubleshooting

### Database Connection Issues

- **Error: Connection refused**
  - Check if database allows connections from Vercel IPs
  - Ensure SSL is enabled (add `?sslmode=require` to connection string)

- **Error: Authentication failed**
  - Verify username/password in connection string
  - Check database user permissions

- **Error: Database does not exist**
  - Create the database first
  - Or use the default database name from your provider

### Migration Issues

- **Error: Migration failed**
  - Check database connection
  - Ensure Prisma schema matches database
  - Try: `npx prisma migrate reset` (⚠️ deletes all data)

### Environment Variables Not Working

- Variables must be added in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)
- Ensure variables are set for the correct environment (Production/Preview/Development)

---

## Database Providers Comparison

| Provider | Free Tier | Ease of Setup | Best For |
|----------|-----------|---------------|----------|
| **Vercel Postgres** | Limited | ⭐⭐⭐⭐⭐ | Vercel projects |
| **Supabase** | 500MB free | ⭐⭐⭐⭐ | Full-featured apps |
| **Neon** | 3GB free | ⭐⭐⭐⭐ | Serverless apps |
| **Railway** | $5 credit | ⭐⭐⭐ | Quick prototyping |

---

## Next Steps After Setup

1. ✅ Database configured
2. ✅ Environment variables set
3. ✅ Application deployed
4. 🔧 Set up authentication (NextAuth/Clerk)
5. 🔧 Configure notifications (Telnyx/Email)
6. 🔧 Add analytics tracking
7. 🔧 Set up error monitoring (Sentry)

---

**Need Help?** Check the logs in Vercel dashboard under **Deployments** → **View Function Logs**

