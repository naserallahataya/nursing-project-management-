const asyncHandler = require("../middleware/asyncHandler");

const Admin = require("../models/Admin.js"); 


exports.loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "Email not found"
    });
  }

  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Incorrect password"
    });
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    admin: {
      id: admin._id,
      email: admin.email
    }
  });
});

exports.createAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const exists = await Admin.findOne({ email });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: "Email already exists"
    });
  }

  const admin = await Admin.create({ email, password });

  res.status(201).json({
    success: true,
    message: "Admin created",
    admin: {
      id: admin._id,
      email: admin.email
    }
  });
});
