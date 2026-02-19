// products-data.js
// Hardcoded products database matching typical grocery store stock
// This is used as fallback when STOCK.xlsx parsing is not available
// Format: { id, name, category, price, quantity }

const PRODUCTS_DATABASE = [
  // Dairy & Milk Products
  { id: 'p-1', name: 'Amul Milk 500ml', category: 'Dairy Products', price: 28, quantity: 150 },
  { id: 'p-2', name: 'Amul Butter 100g', category: 'Dairy Products', price: 42, quantity: 85 },
  { id: 'p-3', name: 'Paneer 250g', category: 'Dairy Products', price: 95, quantity: 60 },
  { id: 'p-4', name: 'Yogurt 500ml', category: 'Dairy Products', price: 35, quantity: 120 },
  { id: 'p-5', name: 'Mozzarella Cheese 200g', category: 'Dairy Products', price: 180, quantity: 45 },

  // Rice, Wheat & Pulses
  { id: 'p-6', name: 'Basmati Rice 1kg', category: 'Rice, Wheat & Pulses', price: 120, quantity: 200 },
  { id: 'p-7', name: 'White Rice 5kg', category: 'Rice, Wheat & Pulses', price: 280, quantity: 150 },
  { id: 'p-8', name: 'Toor Dal 1kg', category: 'Rice, Wheat & Pulses', price: 160, quantity: 180 },
  { id: 'p-9', name: 'Moong Dal 1kg', category: 'Rice, Wheat & Pulses', price: 140, quantity: 170 },
  { id: 'p-10', name: 'Chana Dal 1kg', category: 'Rice, Wheat & Pulses', price: 130, quantity: 160 },
  { id: 'p-11', name: 'Wheat Flour 5kg', category: 'Rice, Wheat & Pulses', price: 180, quantity: 220 },

  // Dry Fruits & Nuts
  { id: 'p-12', name: 'Almonds 250g', category: 'Dry Fruits & Nuts', price: 320, quantity: 80 },
  { id: 'p-13', name: 'Cashews 200g', category: 'Dry Fruits & Nuts', price: 350, quantity: 75 },
  { id: 'p-14', name: 'Raisins 200g', category: 'Dry Fruits & Nuts', price: 140, quantity: 100 },
  { id: 'p-15', name: 'Walnuts 250g', category: 'Dry Fruits & Nuts', price: 380, quantity: 65 },
  { id: 'p-16', name: 'Peanuts 250g', category: 'Dry Fruits & Nuts', price: 90, quantity: 110 },

  // Snacks & Biscuits
  { id: 'p-17', name: 'Parle-G Biscuits 400g', category: 'Snacks & Biscuits', price: 45, quantity: 250 },
  { id: 'p-18', name: 'Britannia Good Day 300g', category: 'Snacks & Biscuits', price: 65, quantity: 180 },
  { id: 'p-19', name: 'Lays Potato Chips 45g', category: 'Snacks & Biscuits', price: 20, quantity: 300 },
  { id: 'p-20', name: 'Pepsi 2L Bottle', category: 'Snacks & Biscuits', price: 95, quantity: 200 },

  // Cooking Oil & Spices/Masala
  { id: 'p-21', name: 'Sunflower Oil 1L', category: 'Cooking Oil & Masala', price: 165, quantity: 190 },
  { id: 'p-22', name: 'Coconut Oil 500ml', category: 'Cooking Oil & Masala', price: 280, quantity: 120 },
  { id: 'p-23', name: 'Chilli Powder 100g', category: 'Cooking Oil & Masala', price: 65, quantity: 150 },
  { id: 'p-24', name: 'Turmeric Powder 100g', category: 'Cooking Oil & Masala', price: 45, quantity: 180 },
  { id: 'p-25', name: 'Garam Masala 100g', category: 'Cooking Oil & Masala', price: 85, quantity: 140 },
  { id: 'p-26', name: 'Salt 1kg', category: 'Cooking Oil & Masala', price: 15, quantity: 300 },

  // Beverages
  { id: 'p-27', name: 'Tea Powder 250g', category: 'Beverages', price: 145, quantity: 170 },
  { id: 'p-28', name: 'Coffee Powder 100g', category: 'Beverages', price: 180, quantity: 95 },
  { id: 'p-29', name: 'Nestle Nescafe 50g', category: 'Beverages', price: 95, quantity: 120 },
  { id: 'p-30', name: 'Tropicana Orange Juice 1L', category: 'Beverages', price: 75, quantity: 140 },

  // Daily Essentials
  { id: 'p-31', name: 'Soap 100g', category: 'Daily Essentials', price: 25, quantity: 400 },
  { id: 'p-32', name: 'Toothpaste 100ml', category: 'Daily Essentials', price: 35, quantity: 350 },
  { id: 'p-33', name: 'Shampoo 200ml', category: 'Daily Essentials', price: 85, quantity: 200 },
  { id: 'p-34', name: 'Detergent Powder 1kg', category: 'Daily Essentials', price: 120, quantity: 250 },
  { id: 'p-35', name: 'Tissue Paper 200 sheets', category: 'Daily Essentials', price: 40, quantity: 300 },
  { id: 'p-36', name: 'Torch Batteries (2pcs)', category: 'Daily Essentials', price: 60, quantity: 180 },
  
  // Special/Premium Products
  { id: 'p-37', name: 'Organic Honey 250g', category: 'Dairy Products', price: 210, quantity: 85 },
];

// Export as CommonJS or for use in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRODUCTS_DATABASE;
}
