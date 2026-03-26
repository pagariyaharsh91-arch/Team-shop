import mongoose from "mongoose";
import dotenv from "dotenv";
import Shop from "./shop.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Shop";

async function seedShops() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected ✅");

    const shops = [
      {
        name: "Pagariya Super Shop",
        email: "pagariya@shop.com",
        password: "123456"
      },
      {
        name: "Vishwas Mega Mart",
        email: "vishwas@shop.com",
        password: "123456"
      }
    ];

    for (const shop of shops) {
      const exists = await Shop.findOne({ email: shop.email });

      if (exists) {
        console.log(`${shop.name} already exists`);
      } else {
        await Shop.create(shop);
        console.log(`${shop.name} created ✅`);
      }
    }

    process.exit();
  } catch (error) {
    console.error("Error seeding shops:", error.message);
    process.exit(1);
  }
}

seedShops();