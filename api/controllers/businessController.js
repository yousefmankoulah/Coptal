import { errorHandler } from "../utils/error.js";
import { Business } from "../models/businessModel.js";
import { deleteFileFromStorage } from "../utils/firebaseConfig.js";
import { User } from "../models/userModel.js";

export const addBusiness = async (req, res, next) => {
  try {
    const {
      businessName,
      businessLogo,
      businessServices,
      servingArea,
      businessDescription,
      businessCategory,
    } = req.body;
    if (!businessName || !servingArea || !businessCategory) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const business = new Business({
      userId: req.params._id,
      businessName,
      businessLogo,
      businessServices: businessServices.map((service) => ({
        serviceName: service.serviceName,
        minPrice: service.minPrice,
        maxPrice: service.maxPrice,
      })),
      businessDescription,
      servingArea: {
        zipCode: servingArea.zipCode,
        rangeInMiles: servingArea.rangeInMiles,
      },
      businessCategory,
    });

    const savedBusiness = await business.save();
    const userInfo = await User.findById(userId);

    if (!userInfo) {
      return res.status(404).json({ error: "User not found" });
    }

    userInfo.role = "business";
    await userInfo.save();
    res.status(201).json(savedBusiness);
  } catch (err) {
    next(errorHandler(err, res));
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const {
      businessName,
      businessLogo,
      businessServices,
      servingArea,
      businessDescription,
      businessCategory,
    } = req.body;
    if (!businessName || !servingArea || !businessCategory) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const userId = req.user.id;
    const businessId = req.params._id;

    const businessInforamtion = await Business.findOne({
      userId: userId,
      _id: businessId,
    });
    if (!businessInforamtion) {
      return res
        .status(404)
        .json({ message: "You are not allowed to update the business info" });
    }

    const business = await Business.findByIdAndUpdate(
      businessId,
      {
        businessName,
        businessLogo,
        businessServices: businessServices.map((service) => ({
          serviceName: service.serviceName,
          minPrice: service.minPrice,
          maxPrice: service.maxPrice,
        })),
        businessDescription,
        servingArea: {
          zipCode: servingArea.zipCode,
          rangeInMiles: servingArea.rangeInMiles,
        },
        businessCategory,
      },
      { new: true }
    );
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business);
  } catch (err) {
    next(errorHandler(err, res));
  }
};

export const deleteBusiness = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const businessId = req.params._id;

    const businessInforamtion = await Business.findOne({
      userId: userId,
      _id: businessId,
    });
    if (!businessInforamtion) {
      return res
        .status(404)
        .json({ message: "You are not allowed to delete the business info" });
    }
    const businessInfo = await Business.findById(businessId);
    const filename = businessInfo.businessLogo;
    await deleteFileFromStorage(filename);
    const business = await Business.findByIdAndRemove(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json({ message: "Business deleted successfully" });
  } catch (err) {
    next(errorHandler(err, res));
  }
};

export const getABusiness = async (req, res, next) => {
  try {
    const businessId = req.params._id;
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business);
  } catch (err) {
    next(errorHandler(err, res));
  }
};

export const getAllBusiness = async (req, res, next) => {
  try {
    const businesses = await Business.find()
      .sort({ averageRating: -1 })
      .populate("businessCategory");
    res.json(businesses);
  } catch (err) {
    next(errorHandler(err, res));
  }
};
