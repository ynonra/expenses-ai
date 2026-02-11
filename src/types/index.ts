export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  aiGenerated?: boolean;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: { [key: string]: number };
  monthlyTrend: { month: string; income: number; expenses: number }[];
}

export interface AIInsight {
  type: 'warning' | 'info' | 'suggestion';
  message: string;
}
