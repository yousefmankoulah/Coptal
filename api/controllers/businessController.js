import { errorHandler } from "../utils/error.js";
import { Business } from "../models/businessModel.js";
import { deleteFileFromStorage } from "../utils/firebaseConfig.js";
import { User } from "../models/userModel.js";
import { getCoordinates, getDistance } from "../utils/geolocation.js";


const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const addressRegex = /\b\d{1,5}\s+\w+\s+\w+\b/;

export const addBusiness = async (req, res, next) => {
  try {
    const {
      businessName,
      businessLogo,
      businessServices,
      zipCode,
      rangeInMiles,
      businessDescription,
      businessCategory,
    } = req.body;

    if (!businessName || !zipCode || !rangeInMiles || !businessCategory) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const checkBusiness = await Business.findOne({
      businessName: businessName,
    });
    if (checkBusiness) {
      return res.status(400).json({ message: "Business already exists" });
    }

    if (phoneRegex.test(businessDescription) || emailRegex.test(businessDescription) || addressRegex.test(businessDescription)) {
      return res.status(400).json({ message: "Business description cannot contain phone number, email address, or address information" });
    }

    const coordinates = await getCoordinates(zipCode);

    let mappedBusinessServices = [];
    if (Array.isArray(businessServices)) {
      // Map business services only if it's an array
      mappedBusinessServices = businessServices.map((service) => ({
        serviceName: service.serviceName,
        minPrice: service.minPrice,
        maxPrice: service.maxPrice,
      }));
    }

    const business = new Business({
      userId: req.params._id,
      businessName,
      businessLogo: businessLogo || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      businessServices: mappedBusinessServices,
      businessDescription,
      servingArea: {
        zipCode: zipCode,
        rangeInMiles: rangeInMiles,
        location: {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude],
        },
      },
      businessCategory,
    });

    const savedBusiness = await business.save();

    const userInfo = await User.findById(req.params._id);

    if (!userInfo) {
      return res.status(404).json({ error: "User not found" });
    }

    userInfo.role = "business";
    await userInfo.save();
    res.status(201).json(savedBusiness);
  } catch (err) {
    next(err); 
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const {
      businessName,
      businessLogo,
      businessServices,
      zipCode,
      rangeInMiles,
      businessDescription,
      businessCategory,
    } = req.body;
    if (!businessName || !zipCode || !rangeInMiles || !businessCategory) {
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

    if (phoneRegex.test(businessDescription) || emailRegex.test(businessDescription) || addressRegex.test(businessDescription)) {
      return res.status(400).json({ message: "Business description cannot contain phone number, email address, or address information" });
    }

    const coordinates = await getCoordinates(zipCode);

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
          zipCode: zipCode,
          rangeInMiles: rangeInMiles,
          location: {
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude],
          },
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

export const getBusinessesByLocation = async (req, res, next) => {
  try {
    const { zipCode, businessCategory } = req.query;

    if (!zipCode) {
      return res.status(400).json({ message: "Zip code is required" });
    }

    const customerCoordinates = await getCoordinates(zipCode);

    // Fetch all businesses
    const businesses = await Business.find({businessCategory: businessCategory})

    // Calculate distances for each business
    const businessDistances = await Promise.all(
      businesses.map(async (business) => {
        if (!business.servingArea.zipCode || !business.servingArea.rangeInMiles) {
          return null;
        }

        const businessCoordinates = await getCoordinates(business.servingArea.zipCode);
        const distance = getDistance(customerCoordinates, businessCoordinates);

        return {
          business,
          distance,
        };
      })
    );

    // Filter out null values (businesses without valid zip code or range) and sort by distance
    const validBusinesses = businessDistances.filter(b => b !== null).sort((a, b) => a.distance - b.distance);

    return res.status(200).json({ businesses: validBusinesses.map(b => b.business) });
  } catch (error) {
    next(error);
  }
};


export const checkBusinessName = async (req, res, next) => {
  const { businessName } = req.body;
  try {
    const lowerCaseName = businessName.toLowerCase();
    const existingBusiness = await Business.findOne({ businessName: { $regex: new RegExp(`^${lowerCaseName}$`, 'i') } });
    res.json({ exists: !!existingBusiness });
  } catch (error) {
      next(error)
  }
}