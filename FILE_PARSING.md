# 📄 File Parsing & AI Enhancement Guide

How file parsing works in Expenses AI and how AI makes it smarter.

## Table of Contents

- [Overview](#overview)
- [How File Parsing Works](#how-file-parsing-works)
- [AI-Enhanced Features](#ai-enhanced-features)
- [Supported File Formats](#supported-file-formats)
- [Column Detection](#column-detection)
- [Data Processing Pipeline](#data-processing-pipeline)
- [Troubleshooting](#troubleshooting)

---

## Overview

Expenses AI can automatically import transactions from bank-exported CSV and Excel files. The process combines:

1. **Client-side parsing**: Fast parsing with PapaParse (CSV) and XLSX (Excel)
2. **AI column detection**: Google Gemini Pro identifies columns intelligently
3. **Smart categorization**: AI categorizes each transaction automatically
4. **Data validation**: Ensures clean, usable data

**All without requiring manual column mapping!**

---

## How File Parsing Works

### Step-by-Step Process

```
1. User uploads file (CSV/Excel)
   ↓
2. Parse file to JSON array
   ↓
3. Extract column headers
   ↓
4. AI detects which columns contain:
   - Date/Time
   - Description/Memo
   - Amount/Value
   ↓
5. Map rows to transaction format
   ↓
6. Preview transactions for user
   ↓
7. User confirms import
   ↓
8. AI categorizes each transaction
   ↓
9. Bulk insert into database
   ↓
10. Done! 🎉
```

### Code Flow

```typescript
// 1. File Upload
handleFile(file) → parseCSV/parseExcel

// 2. AI Column Detection
detectColumnsWithAI(headers) → {
  dateColumn: "Transaction Date",
  descriptionColumn: "Memo",
  amountColumn: "Amount"
}

// 3. Map to Transactions
mapToTransactionsWithAI(data, columnMapping) → [
  { description, amount, date, type }
]

// 4. AI Categorization
categorizeTransactionWithAI(description, amount, type) → "Groceries"

// 5. Save to Database
POST /api/upload → prisma.transaction.createMany()
```

---

## AI-Enhanced Features

### 1. Smart Column Detection 🧠

**Without AI** (rule-based):
```typescript
// Looks for exact keywords in column names
if (header.includes('date') || header.includes('time'))
  → dateColumn
```

**With AI** (Gemini Pro):
```typescript
// Understands context and variations
"Trans. Dt" → dateColumn
"Narration" → descriptionColumn
"Dr/Cr" → amountColumn (with debit/credit logic)
```

**Benefits:**
- ✅ Handles non-standard column names
- ✅ Works with different languages
- ✅ Understands bank-specific formats
- ✅ Adapts to various CSV structures

### 2. Intelligent Categorization 🏷️

**Without AI** (rule-based):
```typescript
if (description.includes('walmart')) → 'Groceries'
```

**With AI** (Gemini Pro):
```typescript
"AMZN Mktp US*M12B9... " → 'Shopping'
"SQ *LOCAL COFFEE SH..." → 'Dining Out'
"PAYPAL *GYMSHARK..." → 'Fitness'
```

**Benefits:**
- ✅ Recognizes merchant codes
- ✅ Understands abbreviations
- ✅ Handles complex descriptions
- ✅ Learns from context

### 3. Advanced Insights 📊

**Without AI** (rule-based):
```typescript
"Your top category is Groceries (40%)"
```

**With AI** (Gemini Pro):
```typescript
[
  "Your dining out expenses are 3x higher than average. Consider meal prep to save ~$200/month.",
  "You have 5 subscription services costing $89/month. Review which ones you actively use.",
  "Great job! Your savings rate of 25% exceeds the recommended 20%."
]
```

**Benefits:**
- ✅ Personalized recommendations
- ✅ Actionable advice
- ✅ Context-aware suggestions
- ✅ Budget planning tips

---

## Supported File Formats

### CSV Files

**Standard Format:**
```csv
Date,Description,Amount
2024-02-01,Walmart Grocery,-125.50
2024-02-05,Monthly Salary,3500.00
```

**Also Supports:**
- Tab-separated values (TSV)
- Semicolon-separated
- Custom delimiters
- With/without headers
- Different date formats

### Excel Files

**Supported Versions:**
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)

**Format Requirements:**
- First sheet is used
- Data should start from row 1 or 2
- Headers in first row
- Date in any Excel date format

---

## Column Detection

### How AI Detects Columns

The AI analyzes column headers and makes intelligent guesses:

**Input Headers:**
```
["Trans Date", "Narration", "Dr", "Cr", "Balance"]
```

**AI Analysis:**
```typescript
{
  dateColumn: "Trans Date",        // Recognizes "Trans Date" as date
  descriptionColumn: "Narration",  // Understands bank terminology
  amountColumn: "Dr"               // Handles debit/credit columns
  // Also considers "Cr" for credits (income)
}
```

### Common Column Name Patterns

**Date Columns:**
- `date`, `Date`, `DATE`
- `transaction_date`, `Transaction Date`
- `posting_date`, `Posting Date`
- `trans_date`, `Trans Dt`
- `value_date`, `bookingDate`

**Description Columns:**
- `description`, `Description`
- `memo`, `Memo`, `MEMO`
- `details`, `Details`
- `narration`, `Narrative`
- `transaction`, `Trans Description`
- `merchant`, `Payee`

**Amount Columns:**
- `amount`, `Amount`, `AMOUNT`
- `value`, `Value`
- `debit`, `Debit`, `Dr`
- `credit`, `Credit`, `Cr`
- `withdrawal`, `Deposit`

### Fallback Mechanism

If AI fails or API key not provided:

1. **Rule-based detection**: Tries common patterns
2. **First column matching**: Uses first matching column
3. **User notification**: Suggests manual review
4. **Preview before import**: Always shows preview

---

## Data Processing Pipeline

### 1. File Upload & Parsing

```typescript
// CSV Parsing (PapaParse)
Papa.parse(file, {
  header: true,        // First row as headers
  skipEmptyLines: true,
  dynamicTyping: true, // Auto-convert numbers
  complete: (results) => {
    // results.data = array of objects
  }
});

// Excel Parsing (XLSX)
const workbook = XLSX.read(fileBuffer, { type: 'array' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);
```

### 2. AI Column Detection

```typescript
// Send headers to Gemini Pro
const headers = Object.keys(data[0]);

const prompt = `
Analyze these CSV/Excel column headers and identify:
1. Transaction date/time
2. Transaction description/memo  
3. Transaction amount/value

Headers: ${headers.join(', ')}

Respond in JSON format.
`;

// Gemini analyzes and responds
const detected = await detectColumnsWithAI(headers);
```

### 3. Data Mapping

```typescript
const transactions = data.map((row) => {
  const description = row[detected.descriptionColumn];
  const amount = parseFloat(row[detected.amountColumn]);
  const date = new Date(row[detected.dateColumn]);
  
  // Determine income vs expense
  const type = amount < 0 ? 'expense' : 'income';
  
  return {
    description,
    amount: Math.abs(amount),
    date: date.toISOString(),
    type
  };
});
```

### 4. AI Categorization

```typescript
// For each transaction
const category = await categorizeTransactionWithAI(
  transaction.description,
  transaction.amount,
  transaction.type
);

// Gemini analyzes merchant/description and assigns category
// "WALMART SUPERCENTER #1234" → "Groceries"
```

### 5. Bulk Database Insert

```typescript
// Efficient batch insert
await prisma.transaction.createMany({
  data: processedTransactions
});
```

---

## Troubleshooting

### Common Issues

**Issue: "No data found in file"**

**Solution:**
- Ensure file has headers in first row
- Check file isn't empty
- Try opening in Excel/Numbers to verify structure

---

**Issue: "Wrong columns detected"**

**Possible Causes:**
- Unusual column names
- Multiple date/amount columns
- Missing AI API key (fallback to basic detection)

**Solution:**
- Check preview before confirming import
- Manually map columns (feature coming soon!)
- Ensure `GEMINI_API_KEY` is set for better detection

---

**Issue: "Transactions not categorized correctly"**

**Solutions:**
- Verify `GEMINI_API_KEY` is configured
- Check Gemini API quota/limits
- Rule-based categorization works as fallback
- Manually edit categories after import

---

**Issue: "File upload fails"**

**Solutions:**
- Check file size (< 5MB recommended)
- Ensure valid CSV/Excel format
- Try saving as new Excel file
- Export as CSV if Excel issues persist

---

**Issue: "Dates not parsing correctly"**

**Causes:**
- Non-standard date formats
- Text dates ("Jan 1, 2024")
- Different locales (DD/MM vs MM/DD)

**Solutions:**
- Use standard date format (YYYY-MM-DD)
- Let AI detect date column (better parsing)
- Check date format in preview

---

### Performance Tips

**For Large Files (>1000 transactions):**

1. **Split into smaller files**: 500-1000 rows each
2. **Check file format**: CSV is faster than Excel
3. **Remove unnecessary columns**: Keep only Date, Description, Amount
4. **Close other tabs**: Browser memory for parsing

**Optimize for Speed:**
```javascript
// Disable AI for very large files (optional)
// Falls back to fast rule-based detection
const USE_AI = transactions.length < 500;
```

---

## Advanced Usage

### Custom Column Mapping (Coming Soon)

```typescript
// Manual override for AI detection
const customMapping = {
  dateColumn: "Booking Date",
  descriptionColumn: "Transaction Details",
  amountColumn: "Debit Amount"
};

mapToTransactionsWithAI(data, customMapping);
```

### Handling Debit/Credit Columns

When file has separate Debit and Credit columns:

```typescript
const amount = parseFloat(row.Debit || row.Credit || 0);
const type = row.Debit ? 'expense' : 'income';
```

### Multiple Currency Support

```typescript
// Strip currency symbols
const amount = parseFloat(
  row.Amount.replace(/[^0-9.-]+/g, '')
);
```

---

## AI API Configuration

### Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Add to Vercel environment variables

### Add to Vercel

```bash
# Via CLI
vercel env add GEMINI_API_KEY

# Or via Dashboard
Settings → Environment Variables → Add
```

### Rate Limits

**Free Tier:**
- 60 requests per minute
- 1,500 requests per day
- Sufficient for personal use

**For high volume:**
- Consider paid tier
- Implement request caching
- Batch similar requests

---

## Technical Details

### Libraries Used

```json
{
  "papaparse": "^5.5.3",     // CSV parsing
  "xlsx": "^0.18.5",          // Excel parsing
  "@google/generative-ai": "^0.1.0"  // Gemini AI
}
```

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### File Size Limits

- **Client-side**: No hard limit (browser memory)
- **Recommended**: < 5MB per file
- **Vercel Free**: 5MB function payload
- **Vercel Pro**: 50MB function payload

---

## Examples

### Example 1: Bank of America Export

```csv
Date,Description,Amount,Running Balance
02/01/2024,WALMART SUPERCENTER #5678,-127.65,2345.67
02/01/2024,ACH DEPOSIT PAYROLL,2500.00,2473.32
```

**AI Detection:**
```json
{
  "dateColumn": "Date",
  "descriptionColumn": "Description",
  "amountColumn": "Amount"
}
```

### Example 2: Chase Bank Export

```csv
Transaction Date,Description,Amount,Type,Balance
02/01/2024,AMAZON MKTPLACE PMTS,-45.99,DEBIT,1234.56
```

**AI Detection:**
```json
{
  "dateColumn": "Transaction Date",
  "descriptionColumn": "Description",
  "amountColumn": "Amount"
}
```

### Example 3: Indian Bank Export

```csv
Trans Date,Narration,Dr,Cr,Balance
01-02-2024,NEFT-SALARY,,50000.00,50000.00
02-02-2024,UPI-SWIGGY,450.00,,49550.00
```

**AI Detection:**
```json
{
  "dateColumn": "Trans Date",
  "descriptionColumn": "Narration",
  "amountColumn": "Dr"  // Also checks Cr for income
}
```

**Handling:**
```typescript
const amount = parseFloat(row.Dr || row.Cr || 0);
const type = row.Dr ? 'expense' : 'income';
```

---

## Future Enhancements

Planned features:

- [ ] Multi-currency support with conversion
- [ ] Manual column mapping UI
- [ ] Save mapping templates per bank
- [ ] Duplicate transaction detection
- [ ] Recurring transaction identification
- [ ] Split transactions support
- [ ] Multi-file batch upload
- [ ] Export back to CSV/Excel

---

**Questions?** Open an issue on [GitHub](https://github.com/ynonra/expenses-ai/issues)

**Want to contribute?** PRs welcome! 🚀
