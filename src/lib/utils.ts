import { Transaction, TransactionStats, AIInsight } from '@/types';
import { startOfMonth, format, parseISO } from 'date-fns';

export function calculateStats(transactions: Transaction[]): TransactionStats {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const categoryBreakdown = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as { [key: string]: number });

  // Calculate monthly trend
  const monthlyData = transactions.reduce((acc, t) => {
    const month = format(parseISO(t.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else {
      acc[month].expenses += t.amount;
    }
    return acc;
  }, {} as { [key: string]: { month: string; income: number; expenses: number } });

  const monthlyTrend = Object.values(monthlyData).sort((a, b) => 
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  return {
    totalIncome,
    totalExpenses,
    balance,
    categoryBreakdown,
    monthlyTrend,
  };
}

export function generateLocalInsights(transactions: Transaction[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const stats = calculateStats(transactions);

  // Check if expenses exceed income
  if (stats.totalExpenses > stats.totalIncome) {
    insights.push({
      type: 'warning',
      message: `Your expenses (${formatCurrency(stats.totalExpenses)}) exceed your income (${formatCurrency(stats.totalIncome)}) by ${formatCurrency(stats.totalExpenses - stats.totalIncome)}.`,
    });
  }

  // Find highest spending category
  const categories = Object.entries(stats.categoryBreakdown);
  if (categories.length > 0) {
    const [topCategory, amount] = categories.reduce((max, curr) => 
      curr[1] > max[1] ? curr : max
    );
    const percentage = (amount / stats.totalExpenses) * 100;
    if (percentage > 30) {
      insights.push({
        type: 'info',
        message: `${topCategory} is your largest expense category, accounting for ${percentage.toFixed(1)}% of total spending.`,
      });
    }
  }

  // Check for positive balance
  if (stats.balance > 0) {
    insights.push({
      type: 'info',
      message: `You have a positive balance of ${formatCurrency(stats.balance)}. Great job managing your finances!`,
    });
  }

  // Analyze monthly trend
  if (stats.monthlyTrend.length >= 2) {
    const lastMonth = stats.monthlyTrend[stats.monthlyTrend.length - 1];
    const prevMonth = stats.monthlyTrend[stats.monthlyTrend.length - 2];
    const expenseChange = lastMonth.expenses - prevMonth.expenses;
    if (expenseChange > 0) {
      const changePercent = (expenseChange / prevMonth.expenses) * 100;
      if (changePercent > 20) {
        insights.push({
          type: 'warning',
          message: `Your expenses increased by ${changePercent.toFixed(1)}% compared to last month.`,
        });
      }
    }
  }

  return insights;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Storage utilities for browser localStorage
export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }
}

export function loadTransactions(): Transaction[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('transactions');
    return data ? JSON.parse(data) : [];
  }
  return [];
}
