import { Business, Review } from "../models/businessModel.js";
import { errorHandler } from "../utils/error.js";
import { Notification, User } from "../models/userModel.js";


const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const addressRegex = /\b\d{1,5}\s+\w+\s+\w+\b/;

export const addRating = async (req, res, next) => {
  // only successful order able to rate but not now
  try {
    const { rating, comment } = req.body;
    const businessId = req.params._id;
    const userId = req.user.id;
    const business = await Business.findById(businessId);
    if (!business) {
      return next(errorHandler("Business not found", 404));
    }
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler("User not found", 404));
    }

    if (phoneRegex.test(comment) || emailRegex.test(comment) || addressRegex.test(comment)) {
      return res.status(400).json({ message: "Comments cannot contain phone number, email address, or address information" });
    }

    const review = new Review({
      rating,
      comment,
      businessId: businessId,
      userId: userId,
    });
    await review.save();
    const addBusinessRating = await Review.find({ businessId: businessId });
    let totalRating = 0;
    addBusinessRating.forEach((rating) => {
      totalRating += rating.rating;
    });
    const averageRating = totalRating / addBusinessRating.length;
    await Business.findByIdAndUpdate(
      businessId,
      { rating: averageRating },
      { new: true }
    );

    const coach = await User.findById(business.userId.toString())

    const notify = new Notification({
      user: business.userId.toString(),
      customer: req.user.id,
      message: `${coach.fullName} has rated your business`,
      postId: business._id,
      classification: "rating",
    });
    await notify.save();

    res.status(201).json({ message: "Rating added successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const reviewId = req.params._id;
    const checkUser = await Review.findOne({
      userId: req.user.id,
      _id: reviewId,
    });
    if (!checkUser) {
      return next(
        new errorHandler("You are not authorized to update this review", 403)
      );
    }
    if (phoneRegex.test(comment) || emailRegex.test(comment) || addressRegex.test(comment)) {
      return res.status(400).json({ message: "Comments cannot contain phone number, email address, or address information" });
    }
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { comment },
      { new: true }
    );
    if (!review) {
      return next(new errorHandler("Review not found", 404));
    }
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const reviewId = req.params._id;
    const checkUser = await Review.findOne({
      userId: req.user.id,
      _id: reviewId,
    });
    if (!checkUser) {
      return next(
        new errorHandler("You are not authorized to delete this review", 403)
      );
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new errorHandler("Review not found", 404));
    }

    // Delete the comment
    review.comment = null; // Assuming comment is a field in the Review model
    await review.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAReview = async (req, res, next) => {
  try {
    const reviewId = req.params._id;
    const review = await Review.findById(reviewId).populate(
      "userId",
      "businessId"
    );
    if (!review) {
      return next(new errorHandler("Review not found", 404));
    }
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getBusinessReview = async (req, res, next) => {
  try {
    const businessId = req.params.businessId;
    const reviews = await Review.find({ businessId: businessId }).populate(
      "userId"
    ).sort({ createdAt: -1 });
    if (!reviews) {
      return next(new errorHandler("Reviews are not found", 404));
    }
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};
