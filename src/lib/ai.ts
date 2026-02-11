import OpenAI from 'openai';
import { Transaction } from '@/types';

// AI service for categorizing transactions and generating insights
export async function categorizeTransactionWithAI(description: string, amount: number, type: 'income' | 'expense'): Promise<string> {
  // For demo purposes without API key, use simple rule-based categorization
  const lowerDesc = description.toLowerCase();
  
  if (type === 'income') {
    if (lowerDesc.includes('salary') || lowerDesc.includes('paycheck')) return 'Salary';
    if (lowerDesc.includes('freelance') || lowerDesc.includes('contract')) return 'Freelance';
    if (lowerDesc.includes('investment') || lowerDesc.includes('dividend')) return 'Investment';
    return 'Other Income';
  }
  
  // Expense categories
  if (lowerDesc.includes('grocery') || lowerDesc.includes('food') || lowerDesc.includes('supermarket')) return 'Groceries';
  if (lowerDesc.includes('restaurant') || lowerDesc.includes('cafe') || lowerDesc.includes('coffee')) return 'Dining Out';
  if (lowerDesc.includes('gas') || lowerDesc.includes('fuel') || lowerDesc.includes('uber') || lowerDesc.includes('taxi')) return 'Transportation';
  if (lowerDesc.includes('rent') || lowerDesc.includes('mortgage')) return 'Housing';
  if (lowerDesc.includes('electric') || lowerDesc.includes('water') || lowerDesc.includes('internet') || lowerDesc.includes('phone')) return 'Utilities';
  if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('subscription')) return 'Entertainment';
  if (lowerDesc.includes('doctor') || lowerDesc.includes('pharmacy') || lowerDesc.includes('hospital')) return 'Healthcare';
  if (lowerDesc.includes('gym') || lowerDesc.includes('fitness')) return 'Fitness';
  if (lowerDesc.includes('clothes') || lowerDesc.includes('shopping')) return 'Shopping';
  
  return 'Other';
}

export async function generateAIInsights(transactions: Transaction[]): Promise<string[]> {
  // For demo purposes, generate insights based on transaction patterns
  const insights: string[] = [];
  
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  if (totalExpenses === 0) {
    return ['Start tracking your expenses to get personalized insights!'];
  }
  
  // Category analysis
  const categories = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as { [key: string]: number });
  
  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  
  if (sortedCategories.length > 0) {
    const [topCategory, amount] = sortedCategories[0];
    const percentage = (amount / totalExpenses) * 100;
    insights.push(`Your top spending category is ${topCategory}, representing ${percentage.toFixed(1)}% of your expenses.`);
  }
  
  // Suggestion based on patterns
  if (categories['Dining Out'] && categories['Groceries']) {
    const diningRatio = categories['Dining Out'] / (categories['Dining Out'] + categories['Groceries']);
    if (diningRatio > 0.5) {
      insights.push('Consider cooking more at home to reduce dining out expenses.');
    }
  }
  
  // Recent transaction insights
  const recentExpenses = expenses.slice(-10);
  const recentTotal = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
  const avgRecent = recentTotal / recentExpenses.length;
  
  if (avgRecent > 50) {
    insights.push(`Your recent transactions average $${avgRecent.toFixed(2)}. Consider tracking smaller daily expenses.`);
  }
  
  return insights.length > 0 ? insights : ['Keep tracking to unlock more insights!'];
}

// If API key is available, use real OpenAI API via server-side endpoint
// Note: For production use, create a Next.js API route at /api/categorize
// This avoids exposing API keys in client-side code
export async function getAICategoryWithAPI(description: string, apiKey: string): Promise<string> {
  try {
    // In production, call your API route instead:
    // const response = await fetch('/api/categorize', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ description }),
    // });
    // return await response.json();
    
    // Demo implementation (not recommended for production due to client-side API key exposure)
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a financial categorization assistant. Categorize the transaction into one of these categories: Groceries, Dining Out, Transportation, Housing, Utilities, Entertainment, Healthcare, Fitness, Shopping, Salary, Freelance, Investment, Other Income, Other. Respond with just the category name."
        },
        {
          role: "user",
          content: `Categorize this transaction: ${description}`
        }
      ],
      max_tokens: 20,
      temperature: 0.3,
    });
    
    return completion.choices[0]?.message?.content?.trim() || 'Other';
  } catch (error) {
    console.error('AI categorization error:', error);
    return 'Other';
  }
}
