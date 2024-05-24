import mongoose from "mongoose";

// Regular expressions to detect addresses, emails, and phone numbers
const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/;
const phoneRegex = /(\+?\d{1,4}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/;
const addressRegex =
  /(address|st|street|road|rd|ave|avenue|blvd|boulevard|drive|dr|lane|ln|court|ct|apt|suite|building|bldg|unit|floor|fl|pobox|po box|zip|zipcode|postal|mail|email|phone|contact)/i;

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
    },

    businessLogo: {
      type: String,
    },

    businessServices: [
      {
        serviceName: {
          type: String,
          required: true,
        },
        minPrice: {
          type: Number,
          required: true,
        },
        maxPrice: {
          type: Number,
          required: true,
        },
      },
    ],

    businessTotalRating: {
      type: Number,
      default: 0,
    },

    businessDescription: {
      type: String,
      validate: {
        validator: function (v) {
          return (
            !emailRegex.test(v) && !phoneRegex.test(v) && !addressRegex.test(v)
          );
        },
        message: (props) =>
          "Business description cannot contain email, phone number, or address information.",
      },
    },

    servingArea: {
      zipCode: {
        type: String,
        required: true,
      },
      rangeInMiles: {
        type: Number,
        required: true,
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
    validate: {
      validator: function (v) {
        return (
          !emailRegex.test(v) && !phoneRegex.test(v) && !addressRegex.test(v)
        );
      },
      message: (props) =>
        "Comment cannot contain email, phone number, or address information.",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", ReviewSchema);
const Business = mongoose.model("Business", businessSchema);

export { Business, Review };
