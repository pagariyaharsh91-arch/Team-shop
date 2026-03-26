import fs from "fs";
import csv from "csv-parser";
import Product from "./Product.js";

export async function importCsvToMongo(filePath, shopId) {
  return new Promise((resolve, reject) => {
    const products = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        products.push({
          shopId,
          name: row.name?.trim() || "Unnamed Product",
          category: row.category?.trim() || "General",
          price: Number(row.price || 0),
          quantity: Number(row.quantity || 0),
          image: row.image?.trim() || ""
        });
      })
      .on("end", async () => {
        try {
          await Product.deleteMany({ shopId });
          await Product.insertMany(products);

          resolve({
            inserted: products.length
          });
        } catch (err) {
          reject(err);
        }
      })
      .on("error", reject);
  });
}