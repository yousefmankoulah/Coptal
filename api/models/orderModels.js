import mongoose from "mongoose";

const OrderRequestSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  serviceDate: {
    type: String,
  },
  service: {
    type: String,
  },
  serviceDescription: {
    type: String,
  },
  zipcode: {
    type: Number,
  },
  phoneNumber: {
    type: Number,
  },
  offerPrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Canceled"],
    default: "Pending"
  },
  paid: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OrderRequest = mongoose.model("OrderRequest", OrderRequestSchema);

export { OrderRequest };


