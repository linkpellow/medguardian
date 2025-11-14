# Meduardian.net - Insurance Lead Collection System

A multi-agent insurance lead collection platform with dynamic forms, intelligent routing, and agent dashboards.

## Features

- **Dynamic Multi-Step Forms** - Agent-customizable form builder
- **Intelligent Lead Routing** - State-based routing with multiple strategies
- **Agent Landing Pages** - Branded, personalized pages for each agent
- **Agent Dashboard** - Profile and form customization
- **Admin Panel** - Platform management and oversight
- **Notifications** - Email and SMS alerts (Telnyx ready)
- **Analytics** - Event tracking for insights

## Tech Stack

- **Next.js 14** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **React Hook Form** - Form management
- **Zod** - Validation
- **shadcn/ui** - UI components

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` with your PostgreSQL connection string.

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Seed the database:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Production Deployment (Vercel)

**Quick Setup:**
1. **Set up Database** (choose one):
   - Vercel Postgres: Storage tab → Create Database
   - Supabase: https://supabase.com (free tier available)
   - Neon: https://neon.tech (serverless Postgres)
   
2. **Run Setup Script:**
```bash
./setup-production.sh "your-database-connection-string"
```

3. **Configure Vercel Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add: `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `NODE_ENV`

4. **Redeploy** your application

📖 **Full setup guide:** See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed instructions.

## Color Scheme

- **Navy Trust** (#0B294B) - Primary
- **Ivory White** (#FAFAF9) - Background
- **Warm Sky Blue** (#7AB8FF) - Accent
- **Muted Aqua** (#77E0C1) - Accent
- **Soft Stone** (#BFC7D1) - Neutral
- **Deep Charcoal** (#333A42) - Text
- **Golden Assurance** (#F5C242) - CTA

## Testing the Full Journey

1. **Access Form**: `/form?agentId={agent-id}`
2. **Fill Form**: Complete all steps
3. **Submit**: Lead is routed and agent is notified
4. **Redirect**: User redirected to agent landing page
5. **Agent Dashboard**: `/dashboard` (login required)
6. **Admin Panel**: `/admin` (admin login required)

## API Routes

- `/api/form/questions?agentId=xyz` - Get form questions
- `/api/lead/submit` - Submit lead
- `/api/agent/[slug]` - Get agent profile
- `/api/agent/profile` - Update agent profile
- `/api/agent/form-settings` - Update form settings
- `/api/admin/*` - Admin operations

## Database Schema

See `prisma/schema.prisma` for complete schema documentation.

## Notifications

The notification system is ready for Telnyx integration. Update `lib/notifications.ts` with your Telnyx API credentials.

## Analytics

Analytics events are tracked and ready for integration with Google Analytics, Mixpanel, etc. Update `lib/analytics.ts` to connect your analytics service.

## License

Private - All rights reserved
