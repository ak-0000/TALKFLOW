import User from "../models/user.model.js";

export const allUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const searchValue = req.query.search?.replace(/['"]+/g, "") || "";

    const keyword = searchValue
  ? {
      $or: [
        { fullName: { $regex: searchValue, $options: "i" } },
        { email: { $regex: searchValue, $options: "i" } },
      ],
    }
  : {};


    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id }, 
    }).select("-password"); 

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
