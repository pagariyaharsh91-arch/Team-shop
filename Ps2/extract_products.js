const XLSX = require('xlsx');
const path = require('path');

try {
    const filePath = path.join(__dirname, 'STOCK.xlsx');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const products = [];
    const grouped = {};
    
    data.forEach(row => {
        const name = row['Product Name'] || row['product_name'] || Object.values(row)[0];
        const category = row['Category'] || row['category'] || Object.values(row)[1];
        let price = row['Price'] || row['price'] || Object.values(row)[2];
        let quantity = row['Quantity'] || row['quantity'] || Object.values(row)[3];
        
        if (!name) return;
        
        if (typeof price === 'string') {
            price = parseFloat(price.replace('₹', '').trim());
            if (isNaN(price)) price = 0;
        }
        
        if (quantity === '' || quantity === null || quantity === undefined) {
            quantity = 0;
        } else {
            quantity = parseInt(quantity);
            if (isNaN(quantity)) quantity = 0;
        }
        
        const productDict = {
            name: String(name).trim(),
            category: String(category).trim(),
            price: price,
            quantity: quantity
        };
        
        products.push(productDict);
        
        const categoryKey = String(category).trim();
        if (!grouped[categoryKey]) {
            grouped[categoryKey] = [];
        }
        grouped[categoryKey].push(productDict);
    });
    
    const result = {
        products: products,
        grouped: grouped,
        total_products: products.length,
        total_categories: Object.keys(grouped).length
    };
    
    console.log(JSON.stringify(result, null, 2));
} catch (error) {
    console.log(JSON.stringify({ error: error.message }, null, 2));
}
