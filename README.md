# Expenses AI 💰

An intelligent expense tracking application built with Next.js that helps you manage your income and expenses with AI-powered insights.

## Features

- 📊 **Smart Transaction Tracking**: Add income and expenses with automatic AI categorization
- 📁 **Bank File Import**: Upload CSV or Excel files from your bank exports
- 🤖 **AI-Powered Insights**: Get intelligent analysis of your spending patterns
- 📈 **Visual Statistics**: Interactive charts showing expense breakdown and trends
- 💡 **Smart Recommendations**: Receive personalized financial advice
- 🌓 **Dark Mode Support**: Beautiful UI that works in light and dark themes
- 💾 **Database Storage**: Persistent storage with PostgreSQL (Vercel Postgres)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Vercel Postgres for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ynonra/expenses-ai.git
cd expenses-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up database (for local development):
```bash
# Install Prisma CLI if needed
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Manual Entry
1. **Add Transactions**: Use the form to add income or expenses
2. **View Statistics**: See your financial overview with charts
3. **Get Insights**: Review AI-generated insights and recommendations

### Bank File Import
1. **Export from Bank**: Download your transaction history as CSV or Excel
2. **Click Import File**: Use the import button on the dashboard
3. **Drag & Drop**: Drop your file or click to browse
4. **Preview & Confirm**: Review the parsed transactions and confirm import
5. **Auto-Categorization**: AI automatically categorizes all imported transactions

### Supported File Formats
- **CSV files**: Standard comma-separated values with headers
- **Excel files**: .xlsx and .xls formats
- **Common columns**: Date, Description, Amount (or variations like Transaction Date, Memo, Debit/Credit)
- **Auto-detection**: Automatically detects column names and transaction types

## Deployment on Vercel

**📋 For complete deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Deploy

1. Push your code to GitHub

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings

3. Add Vercel Postgres:
   - In your Vercel project dashboard
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Follow the setup wizard
   - **Environment variables are automatically configured!**

4. Initialize database schema:
```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push
```

5. Deploy to production:
```bash
vercel --prod
```

### Required Environment Variables

**Automatically set by Vercel Postgres:**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` (recommended for connection pooling)
- All other database connection strings

**Optional:**
- `OPENAI_API_KEY` - For enhanced AI categorization (not required, rule-based works great!)

### What You Need to Know

✅ **No credit card required** for basic deployment
✅ **Environment variables auto-configured** when you add Postgres
✅ **Free tier is perfect** for personal use (100GB bandwidth, 256MB database)
✅ **SSL certificates automatic** via Let's Encrypt
✅ **Continuous deployment** on every Git push

For troubleshooting, monitoring, and advanced configuration, see the [complete deployment guide](./DEPLOYMENT.md).

## Technology Stack

- **Next.js 16**: React framework for production
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Interactive data visualization
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Robust relational database
- **PapaParse**: CSV parsing
- **XLSX**: Excel file parsing
- **Vercel**: Deployment platform

## AI Features

The app uses intelligent algorithms to:
- Automatically categorize transactions based on description
- Detect transaction type (income vs expense) from amount
- Identify spending patterns and trends
- Provide personalized financial insights
- Suggest ways to improve financial health

## API Routes

- `GET /api/transactions` - Fetch all transactions
- `POST /api/transactions` - Create a new transaction
- `DELETE /api/transactions/[id]` - Delete a transaction
- `POST /api/upload` - Bulk import transactions from file

## Build for Production

```bash
npm run build
npm start
```

## License

ISC
