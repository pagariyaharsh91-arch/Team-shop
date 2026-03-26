import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
{
name: { type: String, required: true },
price: { type: Number, required: true },
quantity: { type: Number, required: true },
},
{ _id: false }
);

const orderSchema = new mongoose.Schema(
{
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},

shopId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Shop",
required: false
},

customerName: {
type: String,
required: true
},

phone: {
type: String,
required: true
},

items: {
type: [orderItemSchema],
required: true
},

subtotal: { type: Number, default: 0 },
deliveryCharge: { type: Number, default: 0 },
discount: { type: Number, default: 0 },
total: { type: Number, default: 0 },

status: {
type: String,
default: "pending"
}
},
{ timestamps: true }
);

export default mongoose.model("Order", orderSchema);