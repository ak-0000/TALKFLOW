import bycrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  // Logic for user signup
  console.log("BODY RECEIVED:", req.body); // Add this

  const { fullName, email, password } = req.body;

  try {
    // hash passwords
    // 134234 -> askjdgbeabvpaebwvbesinvbaejles

    if (!fullName || !email || !password) {
      return res.status(400).send("Please fill all the fields");
    }

    if (password.length < 6) {
      return res
        .status(400)
        .send("Password must be at least 6 characters long");
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).send("User already exists with this email");
    }
    const salt = await bycrypt.genSalt(10);
    const hashpassword = await bycrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashpassword,
    });
    if (newUser) {
      // create jwt token
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilepic: newUser.profilepic,
      });
      console.log("User signed up successfully");
    } else {
      return res.status(400).send("Invalid user data");
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Internal server error");
  }
};

export const login = async (req, res) => {
  // Logic for user login
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).send("Please fill all the fields");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // If login is successful, generate a token
    generateToken(user._id, res);
    console.log("User logged in successfully");
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilepic: user.profilepic,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send("Internal server error");
  }
};

export const logout = (req, res) => {
  // Logic for user logout
  try {
    res.cookie("jwt", "", {
      maxAge: 0, // Set cookie to expire immediately
    });
    return res.json({
      message: "logged out successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).send("Internal server error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilepic } = req.body;
    const userId = req.user._id;

    if (!profilepic) {
      return res
        .status(400)
        .json({ message: "Please provide a profile picture" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilepic },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("error in checkAuth :", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
