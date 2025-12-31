import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name for the material"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a price"],
  },
  unit: {
    type: String,
    default: "per piece",
  },
  category: {
    type: String,
    default: "beads",
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Material ||
  mongoose.model("Material", MaterialSchema);
