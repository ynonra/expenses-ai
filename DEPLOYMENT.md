# 🚀 Production Deployment Guide

Complete guide for deploying Expenses AI to production on Vercel.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Detailed Setup Steps](#detailed-setup-steps)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)
- [Security Checklist](#security-checklist)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with your code pushed
- ✅ Vercel account (free tier works fine)
- ✅ Basic understanding of Git and command line

**No credit card required for basic deployment!**

---

## Quick Start

### 1. Deploy to Vercel

```bash
# Option 1: Use Vercel CLI (recommended)
npm i -g vercel
vercel

# Option 2: Use Vercel Dashboard
# Go to https://vercel.com/new and import your GitHub repository
```

### 2. Add Vercel Postgres Database

1. Go to your project dashboard on Vercel
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., "expenses-ai-db")
6. Select region closest to your users
7. Click **Create**

✅ **Environment variables are automatically configured!**

### 3. Initialize Database Schema

```bash
# Connect to your Vercel project
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Deploy!

```bash
# Deploy to production
vercel --prod
```

🎉 **Your app is now live!**

---

## Environment Variables

### Required (Auto-configured by Vercel)

When you add Vercel Postgres, these are **automatically set**:

```bash
POSTGRES_URL                # Direct connection
POSTGRES_PRISMA_URL         # Connection pooling (recommended)
POSTGRES_URL_NO_SSL         # No SSL connection
POSTGRES_URL_NON_POOLING    # Direct non-pooling connection
POSTGRES_USER               # Database user
POSTGRES_HOST               # Database host
POSTGRES_PASSWORD           # Database password
POSTGRES_DATABASE           # Database name
```

**You don't need to set these manually!**

### Optional Environment Variables

#### OpenAI Integration (Optional)

For enhanced AI categorization using GPT models:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

**Note:** The app works great without OpenAI! It uses smart rule-based categorization that handles most transaction types effectively.

#### To add in Vercel:

1. Go to project **Settings** → **Environment Variables**
2. Add `OPENAI_API_KEY`
3. Enter your OpenAI API key
4. Click **Save**
5. Redeploy your app

---

## Detailed Setup Steps

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Import to Vercel

**Via Dashboard:**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your GitHub repository
4. Click **Import**
5. Vercel auto-detects Next.js settings ✨
6. Click **Deploy**

**Via CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? expenses-ai (or your choice)
# - Directory? ./
# - Override settings? No
```

### Step 3: Add Database

1. Navigate to your project dashboard
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Configure:
   - **Database Name:** expenses-ai-db
   - **Region:** Choose closest to your users (e.g., US East for USA)
6. Click **Create**

**Environment variables are automatically added to your project!**

### Step 4: Initialize Database Schema

You have two options:

#### Option A: Via Vercel CLI (Recommended)

```bash
# Pull environment variables
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Verify connection
npx prisma studio
```

#### Option B: Via Project Settings

1. Go to **Settings** → **Functions**
2. Add build command:
   ```bash
   npx prisma generate && npx prisma db push && npm run build
   ```

⚠️ **Note:** Option A is more reliable for first-time setup.

### Step 5: Production Deployment

```bash
# Deploy to production
vercel --prod
```

Visit your production URL! 🎉

---

## Database Setup

### Schema Overview

The database has one main table:

```sql
Table: Transaction
- id (UUID, Primary Key)
- description (String)
- amount (Float)
- date (DateTime)
- type (String: 'income' or 'expense')
- category (String)
- aiGenerated (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Migrations

The app uses `prisma db push` for simplicity. For production with teams, consider migrations:

```bash
# Create migration
npx prisma migrate dev --name init

# Apply to production
npx prisma migrate deploy
```

### Database Access

```bash
# View data with Prisma Studio
vercel env pull .env.local
npx prisma studio
```

Or use the Vercel dashboard:
1. **Storage** → Your database
2. **Data** tab
3. Query and view data

### Backup Strategy

Vercel Postgres includes:
- ✅ Automatic daily backups (retained 7 days)
- ✅ Point-in-time recovery
- ✅ High availability

For additional backups:

```bash
# Export data
npx prisma db pull
pg_dump $POSTGRES_URL > backup.sql
```

---

## Post-Deployment

### Verification Checklist

After deployment, verify:

- [ ] **Homepage loads:** Visit your deployment URL
- [ ] **Add transaction works:** Try adding a manual transaction
- [ ] **File upload works:** Import a sample CSV file
- [ ] **Database persists:** Refresh page, data should remain
- [ ] **AI categorization works:** Check transaction categories
- [ ] **Charts render:** View statistics dashboard
- [ ] **Mobile responsive:** Test on phone
- [ ] **Dark mode works:** Toggle theme

### Performance Monitoring

Vercel provides built-in analytics:

1. Go to **Analytics** tab
2. Monitor:
   - Page load times
   - Core Web Vitals
   - Error rates
   - API response times

### Domain Setup (Optional)

Add custom domain:

1. Go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain (e.g., expenses.yourdomain.com)
4. Follow DNS configuration instructions
5. Certificate auto-provisioned via Let's Encrypt ✨

### Continuous Deployment

Automatic deployments on push:

1. Go to **Settings** → **Git**
2. Configure:
   - **Production Branch:** main
   - **Preview Branches:** Enable
3. Every push to main → auto-deploy to production
4. Pull requests → preview deployments

---

## Troubleshooting

### Build Failures

**Error: "Prisma Client not generated"**

```bash
# Solution: Ensure postinstall script runs
npm install
npx prisma generate
```

**Error: "Cannot connect to database"**

```bash
# Solution: Check environment variables
vercel env pull .env.local
cat .env.local | grep POSTGRES

# Verify database exists in Vercel dashboard
```

### Runtime Errors

**Error: "Database not configured"**

- Ensure Vercel Postgres is added to your project
- Environment variables should be set automatically
- Redeploy after adding database

**Error: 500 on API routes**

- Check Vercel Function logs: **Deployments** → Select deployment → **Functions** tab
- Look for error messages
- Common issue: Database connection timeout (increase timeout in Vercel settings)

### Performance Issues

**Slow page loads:**

- Enable Vercel Edge caching
- Optimize images (use Next.js Image component)
- Review function execution times in Analytics

**Database query timeouts:**

- Use connection pooling (POSTGRES_PRISMA_URL)
- Add database indexes if needed
- Consider pagination for large datasets

### Common Issues

**File upload not working:**

- Check file size limits (default: 5MB on Vercel free tier)
- Verify Content-Type headers
- Test with small CSV file first

**Transactions not saving:**

- Check browser console for errors
- Verify API routes are working: `/api/transactions`
- Check database connection in Function logs

---

## Security Checklist

### Before Going Live

- [ ] **Environment Variables:** Never commit .env files
- [ ] **API Keys:** Use Vercel environment variables (encrypted)
- [ ] **Database:** Ensure SSL connections (enabled by default)
- [ ] **CORS:** Verify API routes only accept valid origins
- [ ] **Input Validation:** Test with malicious inputs
- [ ] **File Uploads:** Validate file types and sizes
- [ ] **Rate Limiting:** Consider adding (Vercel provides DDoS protection)

### Recommended Security Settings

1. **Enable Vercel Authentication (for internal apps):**
   ```bash
   # Settings → Authentication
   # Add password protection or OAuth
   ```

2. **Review Access Logs:**
   ```bash
   # Settings → Logs
   # Monitor unusual activity
   ```

3. **Keep Dependencies Updated:**
   ```bash
   npm audit
   npm update
   ```

### OpenAI API Key Security

If using OpenAI:

- ✅ Store key in Vercel environment variables
- ✅ Never expose in client-side code
- ✅ Implement rate limiting
- ✅ Monitor usage in OpenAI dashboard
- ✅ Set spending limits

---

## Support & Resources

### Documentation

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)

### Getting Help

- **Vercel Issues:** [GitHub Discussions](https://github.com/vercel/vercel/discussions)
- **Next.js Issues:** [GitHub Issues](https://github.com/vercel/next.js/issues)
- **This App:** [GitHub Issues](https://github.com/ynonra/expenses-ai/issues)

### Useful Commands

```bash
# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Environment variables
vercel env ls
vercel env add [name]
vercel env rm [name]

# Link local to project
vercel link

# Open project dashboard
vercel dashboard
```

---

## Cost Estimates

### Vercel Free Tier

Perfect for personal use:

- ✅ 100 GB bandwidth
- ✅ 100 GB-hours serverless function execution
- ✅ Unlimited projects
- ✅ Preview deployments
- ✅ SSL certificates

### Vercel Postgres (Hobby)

Free tier includes:

- ✅ 256 MB storage
- ✅ 60 compute hours/month
- ✅ Suitable for ~1000-5000 transactions

**For higher usage:**
- Pro tier: $20/month (more storage, compute)
- Enterprise: Custom pricing

### OpenAI (Optional)

- GPT-3.5-turbo: ~$0.0005 per transaction
- 1000 transactions: ~$0.50
- Most users don't need this!

---

## Next Steps

After successful deployment:

1. ✅ **Test thoroughly** with real bank exports
2. ✅ **Set up monitoring** via Vercel Analytics
3. ✅ **Configure custom domain** (optional)
4. ✅ **Share with users** and gather feedback
5. ✅ **Monitor usage** to stay within free tier
6. ✅ **Plan for scaling** if needed

---

## Additional Features to Consider

### Future Enhancements

- **User Authentication:** Add NextAuth.js for multi-user support
- **Data Export:** Add CSV/Excel export functionality
- **Email Notifications:** Weekly spending summaries
- **Mobile App:** React Native or PWA
- **Budget Tracking:** Set and monitor budgets
- **Recurring Transactions:** Auto-add subscriptions

---

**Questions?** Open an issue on [GitHub](https://github.com/ynonra/expenses-ai/issues)

**Happy Deploying! 🚀**
