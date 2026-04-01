const User = require("../models/User");
const bcrypt = require("bcryptjs");
const AssignHistory = require("../models/AssignHistory");
const mongoose = require("mongoose");

exports.getAssignHistory = async (req, res) => {
  try {
    const { userId, date } = req.query;

    let filter = {};

    // ✅ FILTER BY USER
    if (userId && userId !== "") {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    // ✅ FILTER BY DATE (VERY IMPORTANT FIX)
    if (date && date !== "") {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: start,
        $lte: end,
      };
    }

    console.log("FILTER:", filter); // 🧪 DEBUG

    const history = await AssignHistory.find(filter)
      .populate("userId", "name")
      .sort({ date: -1 });

    res.json(history);

  } catch (err) {
    console.log(err);
    res.status(500).json("Error fetching history");
  }
};

// GET USERS
exports.getUsers = async (req, res) => {
  const users = await User.find({ role: "counselor" });
  res.json(users);
};

// CREATE USER (🔥 FIXED)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 🔥 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword, // ✅ NOW HASHED
      role: "counselor",
    });

    res.json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
};