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

1. Push your code to GitHub

2. Import project to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Add Vercel Postgres:
   - In your Vercel project dashboard
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Follow the setup wizard

4. Set up database schema:
```bash
# After Vercel Postgres is connected, run:
npx prisma generate
npx prisma db push
```

5. Deploy!
   - Vercel automatically deploys your app
   - Environment variables are automatically configured

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
