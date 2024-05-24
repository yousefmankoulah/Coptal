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

const User = mongoose.model("User", userSchema);

export { User };
