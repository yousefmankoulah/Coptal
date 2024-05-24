import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import passwordValidator from "password-validator";
import nodemailer from "nodemailer";

const schema = new passwordValidator();

export const signup = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (
    !fullName ||
    !email ||
    !password ||
    fullName === "" ||
    email === "" ||
    password === ""
  ) {
    next(errorHandler(400, "All fields are required"));
  }

  schema.is().min(8).is().max(100).has().uppercase().has().lowercase();

  if (!schema.validate(password)) {
    return next(
      errorHandler(
        400,
        "Password must be at least 8 characters long and contain at least one uppercase letter and one lowercase letter"
      )
    );
  }

  const user = await User.findOne({ email });
  if (user) {
    next(errorHandler(400, "User already exists"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    fullName,
    email,
    password: hashedPassword,
  });
  try {
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      newUser,
    });
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }
    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid password"));
    }
    const token = jwt.sign(
      { id: validUser._id, email: validUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: pass, ...rest } = validUser._doc;

    res.status(200);

    res.cookie("access_token", token, {
      httpOnly: true,
    });

    res.setHeader("Authorization", `Bearer ${token}`);
    res.json({ token, rest });
  } catch (error) {
    next(error);
  }
};

export const signinGoogle = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json({ token, rest });
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
      const newUser = new User({
        fullName: name,
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json({ token, rest });
      res.setHeader("Authorization", `Bearer ${token}`);
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { fullName, email, password, profilePicture } = req.body;
  const user = await User.findById(req.user.id);

  if (req.user.id === req.params._id) {
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (req.body.password) {
      schema.is().min(8).is().max(100).has().uppercase().has().lowercase();

      if (!schema.validate(req.body.password)) {
        return next(
          errorHandler(
            400,
            "Password must be at least 8 characters long and contain at least one uppercase letter and one lowercase letter"
          )
        );
      }
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(
        {
          _id: req.params._id,
        },
        {
          $set: {
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            profilePicture: req.body.profilePicture,
          },
        },
        { new: true }
      );
      const { password, ...rest } = updatedUser._doc;
      res.status(200).json(rest);
      res.setHeader("Authorization", `Bearer ${token}`);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
};

export const getCoachProfile = async (req, res, next) => {
  try {
    const coach = await User.findOne({
      _id: req.params._id,
    });
    res.status(200).json(coach);
  } catch (error) {
    next(error);
  }
};

//forget the password
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASSWORD_USER,
  },
});

//   export const sendPasswordResetEmailforCoach = async (req, res, next) => {
//     try {
//       const { email } = req.body;
//       const customer = await User.findOne({ email: email });
//       const resetLink = `https://cautious-journey-5xx4666q445cvjp5-5173.app.github.dev/ResetPasswordCoach/${customer._id}`;
//       await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: "Password Reset",
//         html: `
//                 <p>You have requested a password reset. Click the link below to reset your password:</p>
//                 <a href="${resetLink}">Reset Password</a>
//             `,
//       });
//     } catch (error) {
//       console.error("Error sending password reset email:", error);
//     }
//   };
