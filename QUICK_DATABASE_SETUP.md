# Quick Database Setup - Step by Step

## Choose Your Database Provider

### Option 1: Vercel Postgres (2 minutes)
1. Go to: https://vercel.com/dashboard
2. Click your `medguardian` project
3. Click **Storage** tab
4. Click **Create Database** → **Postgres**
5. Name: `medguardian-db`
6. Click **Create**
7. Copy the connection string (it will be in the format: `postgres://default:xxx@xxx.vercel-storage.com:5432/verceldb`)

### Option 2: Supabase (3 minutes - Free)
1. Go to: https://supabase.com/dashboard
2. Click **New Project**
3. Name: `medguardian`
4. Database Password: (create a strong password - save it!)
5. Region: Choose closest
6. Click **Create new project**
7. Wait ~2 minutes for setup
8. Go to **Settings** → **Database**
9. Copy the **Connection string** (URI format)

### Option 3: Neon (2 minutes - Free)
1. Go to: https://console.neon.tech
2. Click **Create a project**
3. Name: `medguardian`
4. Click **Create project**
5. Copy the connection string from the dashboard

---

## Once You Have the Connection String

**Paste it here and I'll run the setup for you!**

Or run this command yourself:
```bash
cd /Users/linkpellow/Desktop/meduardian.net
./setup-production.sh "your-connection-string-here"
```

---

## Then Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Select `medguardian` project
3. **Settings** → **Environment Variables**
4. Add these 3 variables:

**Variable 1:**
- Key: `DATABASE_URL`
- Value: (your connection string)
- Environment: Production

**Variable 2:**
- Key: `NEXT_PUBLIC_APP_URL`
- Value: `https://medguardian-tau.vercel.app`
- Environment: Production

**Variable 3:**
- Key: `NODE_ENV`
- Value: `production`
- Environment: Production

5. Click **Save** on each
6. Go to **Deployments** tab
7. Click **⋯** on latest deployment → **Redeploy**

---

**That's it!** Your app will be fully functional after redeploy.

