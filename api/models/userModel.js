import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      default: "customer",
    },
  },

  { timestamps: true }
);


const notificationsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  postId: { type: String },
  status: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  classification: {
    type: String,
    enum: ["rating", "requestBusiness", "requestCustomer"],
  },
});


const Notification = mongoose.model("Notification", notificationsSchema);

const User = mongoose.model("User", userSchema);

export { User, Notification };
