import { Business, Review } from "../models/businessModel.js";
import { errorHandler } from "../utils/error.js";
import { User } from "../models/userModel.js";

export const addRating = async (req, res, next) => {
  // only successful order able to rate but not now
  try {
    const { rating, comment } = req.body;
    const businessId = req.params._id;
    const userId = req.user.id;
    const business = await Business.findById(businessId);
    if (!business) {
      return next(new errorHandler("Business not found", 404));
    }
    const user = await User.findById(userId);
    if (!user) {
      return next(new errorHandler("User not found", 404));
    }
    if (user.role !== "customer") {
      return next(new errorHandler("Only customers can add ratings", 403));
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
      "userId",
      "businessId"
    );
    if (!reviews) {
      return next(new errorHandler("Reviews are not found", 404));
    }
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};
