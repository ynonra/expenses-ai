'use client';

import { AIInsight } from '@/types';

interface InsightsPanelProps {
  localInsights: AIInsight[];
  aiInsights: string[];
}

export default function InsightsPanel({ localInsights, aiInsights }: InsightsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Local Rule-based Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔍</span>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Smart Insights
          </h2>
        </div>
        <div className="space-y-3">
          {localInsights.length > 0 ? (
            localInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'warning'
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                    : insight.type === 'suggestion'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-500'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">
                    {insight.type === 'warning' ? '⚠️' : insight.type === 'suggestion' ? '💡' : 'ℹ️'}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {insight.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Add transactions to receive personalized insights
            </p>
          )}
        </div>
      </div>

      {/* AI-Generated Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🤖</span>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            AI Analysis
          </h2>
        </div>
        <div className="space-y-3">
          {aiInsights.length > 0 ? (
            aiInsights.map((insight, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {insight}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading AI insights...
            </p>
          )}
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg shadow-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📊</span>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Pro Tips
          </h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">•</span>
            <span>Transactions are automatically categorized using AI</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">•</span>
            <span>Track both income and expenses for complete financial overview</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">•</span>
            <span>Regular tracking helps identify spending patterns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-1">•</span>
            <span>Import bank CSV/Excel files for quick bulk data entry</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
