import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  customName: String,
  productDescription: String,
  customDescription: String,
  productImage: String,
  productPhoto: String,
  materials: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      unit: String,
      image: String,
      category: String,
    },
  ],
  materialsCount: Number,
  materialsList: String,
  quantity: Number,
  laborCost: Number,
  additionalCost: Number,
  totalCost: Number,
  unitCost: Number,
  sellingPrice: Number,
  unitPrice: Number,
  profitMargin: Number,
  profitAmount: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
