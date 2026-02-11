import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction } from '@/types';

// Initialize Gemini AI client (lazily to avoid build-time errors)
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

// AI-enhanced column detection for file parsing
export async function detectColumnsWithAI(headers: string[]): Promise<{
  dateColumn: string | null;
  descriptionColumn: string | null;
  amountColumn: string | null;
}> {
  const client = getGeminiClient();
  
  if (!client) {
    // Fallback to rule-based detection
    return detectColumnsRuleBased(headers);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze these CSV/Excel column headers and identify which columns contain:
1. Transaction date/time
2. Transaction description/memo
3. Transaction amount/value

Headers: ${headers.join(', ')}

Respond in JSON format only:
{
  "dateColumn": "exact column name or null",
  "descriptionColumn": "exact column name or null",
  "amountColumn": "exact column name or null"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const detected = JSON.parse(jsonMatch[0]);
      return detected;
    }
  } catch (error) {
    console.error('AI column detection error:', error);
  }

  // Fallback to rule-based
  return detectColumnsRuleBased(headers);
}

function detectColumnsRuleBased(headers: string[]): {
  dateColumn: string | null;
  descriptionColumn: string | null;
  amountColumn: string | null;
} {
  const lowerHeaders = headers.map(h => h.toLowerCase());
  
  // Find date column
  const dateColumn = headers[lowerHeaders.findIndex(h => 
    h.includes('date') || h.includes('time') || h.includes('posted')
  )] || null;
  
  // Find description column
  const descriptionColumn = headers[lowerHeaders.findIndex(h => 
    h.includes('description') || h.includes('memo') || h.includes('details') || 
    h.includes('transaction') || h.includes('narrative')
  )] || null;
  
  // Find amount column
  const amountColumn = headers[lowerHeaders.findIndex(h => 
    h.includes('amount') || h.includes('value') || h.includes('debit') || 
    h.includes('credit') || h.includes('balance')
  )] || null;
  
  return { dateColumn, descriptionColumn, amountColumn };
}

// AI service for categorizing transactions
export async function categorizeTransactionWithAI(
  description: string, 
  amount: number, 
  type: 'income' | 'expense'
): Promise<string> {
  const client = getGeminiClient();
  
  if (!client) {
    // Fallback to rule-based categorization
    return categorizeRuleBased(description, type);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    
    const categories = type === 'income' 
      ? ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other Income']
      : ['Groceries', 'Dining Out', 'Transportation', 'Housing', 'Utilities', 
         'Entertainment', 'Healthcare', 'Fitness', 'Shopping', 'Travel', 
         'Education', 'Insurance', 'Other'];
    
    const prompt = `Categorize this ${type} transaction into exactly one of these categories: ${categories.join(', ')}

Transaction: "${description}" for $${amount}

Respond with ONLY the category name, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const category = response.text().trim();
    
    // Validate the category
    if (categories.includes(category)) {
      return category;
    }
  } catch (error) {
    console.error('AI categorization error:', error);
  }

  // Fallback to rule-based
  return categorizeRuleBased(description, type);
}

function categorizeRuleBased(description: string, type: 'income' | 'expense'): string {
  const lowerDesc = description.toLowerCase();
  
  if (type === 'income') {
    if (lowerDesc.includes('salary') || lowerDesc.includes('paycheck')) return 'Salary';
    if (lowerDesc.includes('freelance') || lowerDesc.includes('contract')) return 'Freelance';
    if (lowerDesc.includes('investment') || lowerDesc.includes('dividend')) return 'Investment';
    if (lowerDesc.includes('refund')) return 'Refund';
    if (lowerDesc.includes('gift')) return 'Gift';
    return 'Other Income';
  }
  
  // Expense categories
  if (lowerDesc.includes('grocery') || lowerDesc.includes('food') || lowerDesc.includes('supermarket')) return 'Groceries';
  if (lowerDesc.includes('restaurant') || lowerDesc.includes('cafe') || lowerDesc.includes('coffee') || lowerDesc.includes('dining')) return 'Dining Out';
  if (lowerDesc.includes('gas') || lowerDesc.includes('fuel') || lowerDesc.includes('uber') || lowerDesc.includes('taxi') || lowerDesc.includes('transport')) return 'Transportation';
  if (lowerDesc.includes('rent') || lowerDesc.includes('mortgage')) return 'Housing';
  if (lowerDesc.includes('electric') || lowerDesc.includes('water') || lowerDesc.includes('internet') || lowerDesc.includes('phone') || lowerDesc.includes('utility')) return 'Utilities';
  if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('subscription') || lowerDesc.includes('movie')) return 'Entertainment';
  if (lowerDesc.includes('doctor') || lowerDesc.includes('pharmacy') || lowerDesc.includes('hospital') || lowerDesc.includes('medical')) return 'Healthcare';
  if (lowerDesc.includes('gym') || lowerDesc.includes('fitness') || lowerDesc.includes('sport')) return 'Fitness';
  if (lowerDesc.includes('clothes') || lowerDesc.includes('shopping') || lowerDesc.includes('store')) return 'Shopping';
  if (lowerDesc.includes('hotel') || lowerDesc.includes('flight') || lowerDesc.includes('travel')) return 'Travel';
  if (lowerDesc.includes('school') || lowerDesc.includes('education') || lowerDesc.includes('course') || lowerDesc.includes('tuition')) return 'Education';
  if (lowerDesc.includes('insurance')) return 'Insurance';
  
  return 'Other';
}

export async function generateAIInsights(transactions: Transaction[]): Promise<string[]> {
  const client = getGeminiClient();
  
  if (!client) {
    return generateRuleBasedInsights(transactions);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    
    // Prepare transaction summary
    const summary = {
      totalTransactions: transactions.length,
      totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      categories: transactions.reduce((acc, t) => {
        if (t.type === 'expense') {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
        return acc;
      }, {} as { [key: string]: number }),
      recentTransactions: transactions.slice(0, 10).map(t => ({
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category
      }))
    };

    const prompt = `Analyze these financial transactions and provide 3-4 actionable insights:

Summary:
- Total Transactions: ${summary.totalTransactions}
- Total Income: $${summary.totalIncome.toFixed(2)}
- Total Expenses: $${summary.totalExpenses.toFixed(2)}
- Balance: $${(summary.totalIncome - summary.totalExpenses).toFixed(2)}

Expense Categories:
${Object.entries(summary.categories).map(([cat, amt]) => `- ${cat}: $${(amt as number).toFixed(2)}`).join('\n')}

Recent Transactions:
${summary.recentTransactions.map(t => `- ${t.description} ($${t.amount})`).join('\n')}

Provide insights as a JSON array of strings. Focus on:
1. Spending patterns
2. Budget recommendations
3. Savings opportunities
4. Financial health

Format: ["insight 1", "insight 2", "insight 3"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON array
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      if (Array.isArray(insights) && insights.length > 0) {
        return insights;
      }
    }
  } catch (error) {
    console.error('AI insights error:', error);
  }

  return generateRuleBasedInsights(transactions);
}

function generateRuleBasedInsights(transactions: Transaction[]): string[] {
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
