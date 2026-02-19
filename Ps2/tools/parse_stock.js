// parse_stock.js
// Node script to parse STOCK.xlsx and output normalized JSON to stdout
// Usage: node tools\parse_stock.js

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const filePath = path.join(__dirname, '..', 'STOCK.xlsx');
if (!fs.existsSync(filePath)) {
  console.error('STOCK.xlsx not found at', filePath);
  process.exit(2);
}

try {
  const workbook = XLSX.readFile(filePath);
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  const raw = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const products = raw.map((row, idx) => {
    const name = row['Product Name'] || row['Name'] || row['product_name'] || row['product'] || Object.values(row)[0] || '';
    const category = row['Category'] || row['category'] || row['Cat'] || row['Group'] || Object.values(row)[1] || 'Uncategorized';
    const priceRaw = row['Price'] || row['price'] || row['MRP'] || Object.values(row)[2] || '';
    const qtyRaw = row['Quantity'] || row['Qty'] || row['quantity'] || Object.values(row)[3] || '';

    const price = parseFloat(String(priceRaw).replace(/[^0-9.\-]/g, '')) || 0;
    const quantity = qtyRaw === '' ? '' : (parseInt(String(qtyRaw).replace(/[^0-9\-]/g, '')) || 0);

    return {
      id: 'imp-' + Date.now() + '-' + idx,
      name: String(name).trim(),
      category: String(category).trim() || 'Uncategorized',
      price,
      quantity
    };
  }).filter(p => p.name);

  // Group by category
  const grouped = {};
  products.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  const output = { products, grouped };
  console.log(JSON.stringify(output, null, 2));
} catch (err) {
  console.error('Error parsing STOCK.xlsx:', err.message);
  process.exit(1);
}
