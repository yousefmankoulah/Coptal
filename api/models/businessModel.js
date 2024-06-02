import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Define userId as ObjectId
      ref: "User",
      required: true,
    },

    businessName: {
      type: String,
      required: true,
      unique: true,
    },

    businessLogo: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
    },

    businessServices: [
      {
        serviceName: {
          type: String,
        },
        minPrice: {
          type: Number,
        },
        maxPrice: {
          type: Number,
        },
      },
    ],

    businessTotalRating: {
      type: String,
      default: "0.0",
    },

    businessDescription: {
      type: String,
      
    },

    servingArea: {
      zipCode: {
        type: Number,
        required: true,
      },
      rangeInMiles: {
        type: Number,
        required: true,
      },
      location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true },
      },
    },

    businessCategory: {
      type: String,
      enum: [
        "locksmith services",
        "garage door services",
        "tow truck services",
        "cleaning services",
        "pest control services",
        "swimming pool maintenance",
        "construction services",
        "heating and air condition services",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const ReviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", ReviewSchema);
const Business = mongoose.model("Business", businessSchema);

export { Business, Review };
