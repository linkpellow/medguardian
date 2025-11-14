# Production Setup Guide

## Step-by-Step Launch Process

### Phase 1: Database & Infrastructure (Day 1)

1. **Set up PostgreSQL Database**
   ```bash
   # Option 1: Local PostgreSQL
   createdb meduardian
   
   # Option 2: Cloud (Supabase, Neon, Railway, etc.)
   # Create database and get connection string
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Run Database Migrations**
   ```bash
   npm run db:migrate
   npm run db:seed  # Seed initial data
   ```

4. **Verify Database Connection**
   ```bash
   npm run db:studio  # Should connect and show tables
   ```

### Phase 2: Authentication (Day 2)

**Option A: NextAuth.js (Recommended)**
```bash
npm install next-auth
```

Update `lib/auth.ts` to use NextAuth.js instead of mock auth.

**Option B: Clerk (Easier)**
```bash
npm install @clerk/nextjs
```

Follow Clerk setup guide.

### Phase 3: Notifications (Day 3)

1. **Telnyx Setup**
   - Sign up at telnyx.com
   - Get API key
   - Purchase phone number
   - Update `lib/notifications.ts`:
   ```typescript
   import Telnyx from 'telnyx'
   const telnyx = new Telnyx(process.env.TELNYX_API_KEY)
   ```

2. **Email Service Setup**
   - Choose: Resend (recommended) or SendGrid
   - Get API key
   - Update `lib/notifications.ts` with email service

### Phase 4: Security & Performance (Day 4)

1. **Security Checklist**
   - [ ] Enable HTTPS
   - [ ] Set secure cookie flags
   - [ ] Add rate limiting
   - [ ] Review CORS settings
   - [ ] Audit dependencies

2. **Performance**
   - [ ] Run `npm run build`
   - [ ] Check bundle size
   - [ ] Optimize images
   - [ ] Set up CDN if needed

### Phase 5: Testing (Day 5)

1. **End-to-End Testing**
   - Test form submission
   - Test lead routing
   - Test notifications
   - Test agent dashboard
   - Test admin panel

2. **Load Testing**
   - Test with multiple concurrent users
   - Verify database performance

### Phase 6: Deployment (Day 6)

**Vercel (Recommended for Next.js)**
```bash
npm install -g vercel
vercel
# Follow prompts
```

**Other Options:**
- AWS (Amplify, EC2)
- Railway
- Render
- DigitalOcean

## Critical Files to Review Before Launch

1. `lib/auth.ts` - Authentication system
2. `lib/notifications.ts` - Email/SMS integration
3. `lib/analytics.ts` - Analytics integration
4. `app/api/lead/submit/route.ts` - Lead submission logic
5. `middleware.ts` - Route protection
6. `.env` - All environment variables

## Post-Launch Monitoring

1. **Set up error tracking** (Sentry)
2. **Monitor database** performance
3. **Track analytics** events
4. **Monitor notification** delivery rates
5. **Set up alerts** for critical errors

## Rollback Plan

1. Keep previous database backups
2. Version control all code
3. Document deployment process
4. Test rollback procedure

