import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop"
    },
    name: String,
    category: String,
    price: Number,
    quantity: Number,
    image: String
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);