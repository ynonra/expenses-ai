import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categorizeTransactionWithAI } from '@/lib/ai';

export const dynamic = 'force-dynamic';

// POST bulk import transactions from file
export async function POST(request: NextRequest) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }
  
  try {
    const body = await request.json();
    const { transactions } = body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid transactions data' },
        { status: 400 }
      );
    }

    // Process and categorize transactions with AI
    const processedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const category = await categorizeTransactionWithAI(
          tx.description,
          tx.amount,
          tx.type
        );

        return {
          description: tx.description,
          amount: parseFloat(tx.amount),
          date: new Date(tx.date),
          type: tx.type,
          category,
          aiGenerated: true,
        };
      })
    );

    // Bulk insert into database
    const result = await prisma.transaction.createMany({
      data: processedTransactions,
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading transactions:', error);
    return NextResponse.json(
      { error: 'Failed to upload transactions' },
      { status: 500 }
    );
  }
}
