import json
from pathlib import Path

try:
    import openpyxl
    wb = openpyxl.load_workbook(r'C:\Users\pagar\Desktop\Ps2\STOCK.xlsx')
    ws = wb.active
    
    rows = list(ws.iter_rows(values_only=True))
    headers = rows[0]
    
    products = []
    grouped = {}
    
    for row in rows[1:]:
        if not any(row):
            continue
            
        product = {}
        for i, header in enumerate(headers):
            product[header.lower().replace(' ', '_')] = row[i]
        
        name = product.get('product_name', '')
        category = product.get('category', '')
        price = product.get('price', '')
        quantity = product.get('quantity', '')
        
        if name:
            if isinstance(price, str):
                price = price.replace('₹', '').strip()
                try:
                    price = float(price)
                except:
                    price = price
            
            if quantity == '' or quantity is None:
                quantity = 0
            else:
                try:
                    quantity = int(quantity)
                except:
                    quantity = 0
            
            product_dict = {
                "name": name,
                "category": category,
                "price": price,
                "quantity": quantity
            }
            products.append(product_dict)
            
            if category not in grouped:
                grouped[category] = []
            grouped[category].append(product_dict)
    
    result = {
        "products": products,
        "grouped": grouped,
        "total_products": len(products),
        "total_categories": len(grouped)
    }
    
    print(json.dumps(result, ensure_ascii=False, indent=2))

except Exception as e:
    try:
        import pandas as pd
        df = pd.read_excel(r'C:\Users\pagar\Desktop\Ps2\STOCK.xlsx')
        
        products = []
        grouped = {}
        
        for _, row in df.iterrows():
            name = row.iloc[0]
            category = row.iloc[1]
            price = row.iloc[2]
            quantity = row.iloc[3]
            
            if pd.isna(name):
                continue
            
            if isinstance(price, str):
                price = price.replace('₹', '').strip()
                try:
                    price = float(price)
                except:
                    price = price
            
            if pd.isna(quantity) or quantity == '':
                quantity = 0
            else:
                try:
                    quantity = int(quantity)
                except:
                    quantity = 0
            
            product_dict = {
                "name": str(name),
                "category": str(category),
                "price": price,
                "quantity": quantity
            }
            products.append(product_dict)
            
            category_key = str(category)
            if category_key not in grouped:
                grouped[category_key] = []
            grouped[category_key].append(product_dict)
        
        result = {
            "products": products,
            "grouped": grouped,
            "total_products": len(products),
            "total_categories": len(grouped)
        }
        
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e2:
        print(json.dumps({"error": str(e2)}, ensure_ascii=False))
