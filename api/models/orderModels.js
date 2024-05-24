import mongoose from "mongoose";

const OrderRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  confirmed: {
    type: Boolean,
    default: false,
  },
});




const OrderRequest = mongoose.model("OrderRequest", OrderRequestSchema);

export { OrderRequest };
