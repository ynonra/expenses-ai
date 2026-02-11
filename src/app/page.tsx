'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { calculateStats, generateLocalInsights } from '@/lib/utils';
import { categorizeTransactionWithAI, generateAIInsights } from '@/lib/ai';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import StatsDisplay from '@/components/StatsDisplay';
import InsightsPanel from '@/components/InsightsPanel';
import FileUpload from '@/components/FileUpload';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
        if (data.length > 0) {
          generateAIInsights(data).then(setAiInsights);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'category' | 'aiGenerated'>) => {
    const category = await categorizeTransactionWithAI(data.description, data.amount, data.type);
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          category,
          aiGenerated: true,
        }),
      });

      if (response.ok) {
        // Refresh transactions list
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const handleFileImport = async (importedTransactions: any[]) => {
    try {
      setLoading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: importedTransactions }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully imported ${result.count} transactions!`);
        setShowUpload(false);
        // Refresh transactions list
        fetchTransactions();
      } else {
        alert('Failed to import transactions');
      }
    } catch (error) {
      console.error('Error importing transactions:', error);
      alert('Failed to import transactions');
    } finally {
      setLoading(false);
    }
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
            {showUpload ? (
              <FileUpload onImport={handleFileImport} />
            ) : (
              <>
                <div className="flex gap-4 items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Import from Bank
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Upload CSV or Excel file
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Import File
                  </button>
                </div>
                <TransactionForm onSubmit={handleAddTransaction} />
              </>
            )}
            {showUpload && (
              <button
                onClick={() => setShowUpload(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                ← Back to Manual Entry
              </button>
            )}
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
