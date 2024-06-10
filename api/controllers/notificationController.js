import { Notification } from "../models/userModel.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,   
    }).sort({ date: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};


export const NotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params._id,
      { status: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};