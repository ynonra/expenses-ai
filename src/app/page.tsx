'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { loadTransactions, saveTransactions, calculateStats, generateLocalInsights, generateId } from '@/lib/utils';
import { categorizeTransactionWithAI, generateAIInsights } from '@/lib/ai';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import StatsDisplay from '@/components/StatsDisplay';
import InsightsPanel from '@/components/InsightsPanel';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load transactions from localStorage
    const loaded = loadTransactions();
    setTransactions(loaded);
    setLoading(false);
    
    // Generate AI insights
    if (loaded.length > 0) {
      generateAIInsights(loaded).then(setAiInsights);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      saveTransactions(transactions);
      if (transactions.length > 0) {
        generateAIInsights(transactions).then(setAiInsights);
      }
    }
  }, [transactions, loading]);

  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'category' | 'aiGenerated'>) => {
    const category = await categorizeTransactionWithAI(data.description, data.amount, data.type);
    
    const newTransaction: Transaction = {
      ...data,
      id: generateId(),
      category,
      aiGenerated: true,
    };

    setTransactions([newTransaction, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const stats = calculateStats(transactions);
  const localInsights = generateLocalInsights(transactions);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            💰 Expenses AI
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Smart expense tracking with AI-powered insights
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <TransactionForm onSubmit={handleAddTransaction} />
            <StatsDisplay stats={stats} />
            <TransactionList 
              transactions={transactions} 
              onDelete={handleDeleteTransaction}
            />
          </div>
          
          <div className="space-y-6">
            <InsightsPanel 
              localInsights={localInsights}
              aiInsights={aiInsights}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
