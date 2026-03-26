import xlsx from "xlsx";
import Product from "./Product.js";

export async function importXlsxToMongo(filePath, shopId) {
  try {
    console.log("READING FILE =", filePath);

    const workbook = xlsx.readFile(filePath);
    console.log("SHEETS =", workbook.SheetNames);

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    console.log("ROWS COUNT =", rows.length);
    console.log("FIRST 3 ROWS =", rows.slice(0, 3));

    const products = rows.map((row) => ({
      shopId,
      name:
        row.name ||
        row.Name ||
        row["Item Name"] ||
        row["Product Name"] ||
        "Unnamed Product",

      category:
        row.category ||
        row.Category ||
        row["Main Category"] ||
        "General",

      price: Number(
        row.price ||
        row.Price ||
        row.MRP ||
        0
      ),

      quantity: Number(
        row.quantity ||
        row.Quantity ||
        row.stock ||
        row.Stock ||
        row["Cl.Stock"] ||
        0
      ),

      image:
        row.image ||
        row.Image ||
        row["Image URL"] ||
        ""
    }));

    console.log("PRODUCTS TO INSERT =", products.length);
    console.log("FIRST PRODUCT =", products[0]);

    await Product.deleteMany({ shopId });

    if (products.length > 0) {
      await Product.insertMany(products);
    }

    return {
      success: true,
      inserted: products.length
    };
  } catch (err) {
    console.log("IMPORT XLSX ERROR =", err);
    throw err;
  }
}