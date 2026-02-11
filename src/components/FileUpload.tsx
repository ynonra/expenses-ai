'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onImport: (transactions: any[]) => void;
}

export default function FileUpload({ onImport }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      let parsedData: any[] = [];

      if (extension === 'csv') {
        parsedData = await parseCSV(file);
      } else if (extension === 'xlsx' || extension === 'xls') {
        parsedData = await parseExcel(file);
      } else {
        alert('Unsupported file format. Please upload CSV or Excel files.');
        setUploading(false);
        return;
      }

      // Map to transaction format
      const transactions = mapToTransactions(parsedData);
      setPreview(transactions);
      setShowPreview(true);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const mapToTransactions = (data: any[]) => {
    return data.map((row) => {
      // Common column name variations
      const description = 
        row.description || row.Description || 
        row.memo || row.Memo || 
        row.details || row.Details ||
        row.transaction || row.Transaction || '';

      const amount = parseFloat(
        row.amount || row.Amount || 
        row.value || row.Value || 
        row.debit || row.Debit ||
        row.credit || row.Credit || '0'
      );

      const date = 
        row.date || row.Date || 
        row.transaction_date || row['Transaction Date'] ||
        row.posting_date || row['Posting Date'] ||
        new Date().toISOString();

      // Determine if it's income or expense
      const type = amount < 0 ? 'expense' : 'income';
      const absAmount = Math.abs(amount);

      return {
        description: description.toString(),
        amount: absAmount,
        date: new Date(date).toISOString(),
        type,
      };
    }).filter(tx => tx.description && tx.amount > 0);
  };

  const handleConfirmImport = () => {
    onImport(preview);
    setShowPreview(false);
    setPreview([]);
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreview([]);
  };

  if (showPreview) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Preview Import ({preview.length} transactions)
        </h2>
        
        <div className="max-h-96 overflow-y-auto mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 50).map((tx, idx) => (
                <tr key={idx} className="border-b dark:border-gray-700">
                  <td className="p-2">{tx.description}</td>
                  <td className="p-2">${tx.amount.toFixed(2)}</td>
                  <td className="p-2">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      tx.type === 'income' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.length > 50 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Showing first 50 of {preview.length} transactions
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleConfirmImport}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Import {preview.length} Transactions
          </button>
          <button
            onClick={handleCancelPreview}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Import Bank Transactions
      </h2>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Processing file...</p>
          </div>
        ) : (
          <>
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drop your bank export file here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              or click to browse
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg cursor-pointer transition duration-200"
            >
              Choose File
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Supports CSV and Excel (.xlsx, .xls) files
            </p>
          </>
        )}
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
          📋 Supported File Formats
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• CSV files with headers (Date, Description, Amount)</li>
          <li>• Excel files (.xlsx, .xls) with transaction data</li>
          <li>• Common bank export formats automatically detected</li>
          <li>• Negative amounts treated as expenses, positive as income</li>
        </ul>
      </div>
    </div>
  );
}
