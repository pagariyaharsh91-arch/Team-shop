import express from "express";
import multer from "multer";
import Product from "./Product.js";
import { importCsvToMongo } from "./csvImporter.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CSV file required" });
    }

    const headerMap = {
      "Item Name": "name",
      "MRP": "price",
      "Cl.Stock": "quantity",
      // "Category": "category"
    };

    const result = await importCsvToMongo({
      fileBuffer: req.file.buffer,
      Model: Product,
      headerMap,
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;