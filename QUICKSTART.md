# 🚀 Quick Production Setup Guide

## What You Need for Production Deploy

### Required ✅

1. **Vercel Account** (free tier works!)
   - Sign up at [vercel.com](https://vercel.com)
   
2. **GitHub Repository**
   - Code pushed to GitHub
   
3. **Vercel Postgres Database**
   - Added via Vercel dashboard (Storage → Create Database → Postgres)
   - **Environment variables auto-configured!**

### Optional (Highly Recommended) 💡

4. **Google Gemini API Key**
   - Get free at [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Enables AI-enhanced features
   - Free tier: 1,500 requests/day

---

## Environment Variables Summary

### Auto-Configured by Vercel Postgres

These are **automatically set** when you add Postgres storage:

```bash
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NO_SSL  
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

**You don't need to set these manually!**

### Manual Configuration (Optional)

```bash
GEMINI_API_KEY="AIza..."  # For AI-enhanced features
```

---

## Quick Deploy Steps

### 1. Deploy to Vercel (2 minutes)

```bash
# Option 1: CLI
npm i -g vercel
vercel

# Option 2: Dashboard
# Go to vercel.com/new → Import your GitHub repo
```

### 2. Add Database (1 minute)

In Vercel Dashboard:
1. Go to your project
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Click **Create**

✅ Environment variables automatically added!

### 3. Initialize Database (1 minute)

```bash
# Pull environment variables
vercel env pull .env.local

# Setup database schema
npx prisma generate
npx prisma db push
```

### 4. (Optional) Add Gemini AI

1. Get API key: https://makersuite.google.com/app/apikey
2. In Vercel: Settings → Environment Variables
3. Add: `GEMINI_API_KEY` = `AIza...`
4. Click Save

### 5. Deploy!

```bash
vercel --prod
```

---

## What Each Environment Variable Does

### Database Variables (Auto-configured)

| Variable | Purpose |
|----------|---------|
| `POSTGRES_PRISMA_URL` | **Main connection** (uses pooling, recommended) |
| `POSTGRES_URL` | Direct connection |
| `POSTGRES_URL_NON_POOLING` | Direct without pooling (for migrations) |
| Other vars | Host, user, password, database name |

### AI Variable (Manual)

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Enables AI features: Smart column detection, Intelligent categorization, Advanced insights |

---

## AI Features: With vs Without API Key

### With Gemini API Key 🧠

✅ Smart column detection in CSV/Excel files
✅ Better categorization of complex transactions
✅ Personalized financial insights
✅ Handles non-standard file formats
✅ Understands merchant codes and abbreviations

### Without API Key (Still Great!) 📊

✅ Rule-based column detection (works well)
✅ Basic categorization (covers most cases)
✅ Simple insights and statistics
✅ All core features functional
✅ Fast processing

**Recommendation:** Start without API key, add later if you want enhanced AI features.

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Homepage loads at your Vercel URL
- [ ] Can add a manual transaction
- [ ] Can upload a CSV file
- [ ] Transactions persist after refresh
- [ ] Charts and statistics display
- [ ] Mobile view works correctly

---

## Troubleshooting

**Build fails?**
- Check logs in Vercel dashboard
- Ensure dependencies installed: `npm install`

**Database connection error?**
- Verify Postgres was added in Storage tab
- Environment variables should auto-populate
- Try redeploying: `vercel --prod`

**File upload not working?**
- Check file size (< 5MB)
- Ensure file has headers
- Try with sample CSV first

**AI features not working?**
- Verify `GEMINI_API_KEY` is set
- Check Google AI Studio for API limits
- Falls back to rule-based (still works!)

---

## Cost Breakdown

### Vercel (Free Tier)

**Included:**
- 100 GB bandwidth/month
- 100 GB-hours serverless execution
- Unlimited projects
- SSL certificates
- Preview deployments

**Perfect for:**
- Personal use
- Small teams
- Up to thousands of users

### Vercel Postgres (Hobby - Free)

**Included:**
- 256 MB storage
- 60 compute hours/month
- ~1,000-5,000 transactions

**Need more?**
- Pro: $20/month (more storage/compute)

### Google Gemini (Free Tier)

**Included:**
- 60 requests/minute
- 1,500 requests/day
- Perfect for personal use

**Typical usage:**
- Import 100 transactions: ~100 API calls
- View insights: ~10 API calls/day
- Most users stay in free tier

---

## Production URLs

After deployment, you'll get:

**Production:**
```
https://your-project.vercel.app
```

**Preview (for each PR):**
```
https://your-project-git-branch.vercel.app
```

**Custom Domain (optional):**
```
https://expenses.yourdomain.com
```

---

## Next Steps

1. **✅ Deploy** - Follow quick steps above
2. **📊 Test** - Upload a sample CSV file
3. **🔑 Add AI** - Get Gemini API key (optional)
4. **📱 Use** - Start tracking your expenses!
5. **🌐 Domain** - Add custom domain (optional)

---

## Support & Resources

**Documentation:**
- 📄 [FILE_PARSING.md](./FILE_PARSING.md) - How file parsing works
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- 📖 [README.md](./README.md) - Getting started guide

**Get Help:**
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [GitHub Issues](https://github.com/ynonra/expenses-ai/issues)

---

**Ready to deploy? Just run `vercel` and follow the prompts!** 🚀
