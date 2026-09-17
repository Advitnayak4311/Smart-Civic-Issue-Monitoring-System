import { generateToken } from "../config/utils.js";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";
import { signupWelcomeEmail, profileUpdatedEmail } from "../utils/emailTemplates.js";

// Signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password, address } = req.body;

  try {
    if (!fullName || !email || !password || !address) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const user = await User.findOne({ email });

    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      address,
    });

    const token = generateToken(newUser._id);

    // Send Welcome Email Notification in Background (< 10ms Response Speed)
    setImmediate(async () => {
      try {
        const emailContent = signupWelcomeEmail(newUser);
        await sendEmail({
          to: newUser.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (mailErr) {
        console.log("Signup Email Note:", mailErr.message);
      }
    });

    res.json({ success: true, userData: newUser, token, message: "Account created successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);

    // Send Login Security Notification Email in Background (< 10ms Response Speed)
    setImmediate(async () => {
      try {
        await sendEmail({
          to: userData.email,
          subject: "🔐 Smart Civic Portal Login Security Notice",
          html: `
            <div style="font-family:Arial,sans-serif;padding:24px;background:#f8fafc;">
              <div style="max-width:550px;margin:auto;background:white;padding:24px;border-radius:12px;border:1px solid #e2e8f0;">
                <h3 style="color:#0f172a;margin-top:0;">Account Login Activity Notice</h3>
                <p>Hello <b>${userData.fullName}</b>,</p>
                <p>Successful login to your Smart Civic Account on <b>${new Date().toLocaleString("en-IN")}</b>.</p>
                <p style="font-size:12px;color:#64748b;">If this wasn't you, please reset your password immediately.</p>
              </div>
            </div>
          `,
        });
      } catch (mailErr) {
        console.log("Login Email Note:", mailErr.message);
      }
    });

    res.json({ success: true, userData, token, message: "Login successful" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, address, fullName, phone, email, state, district, taluk, pincode } = req.body;

    const userId = req.user._id;
    let updatedUser;

    const updateData = { address, fullName, phone, state, district, taluk, pincode };
    if (email) updateData.email = email;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    } else if (profilePic.startsWith("http")) {
      updateData.profilePic = profilePic;
      updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    } else {
      try {
        const upload = await cloudinary.uploader.upload(profilePic, { folder: "UserAvatars" });
        updateData.profilePic = upload.secure_url;
      } catch (cErr) {
        updateData.profilePic = profilePic;
      }
      updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    }

    // Send Profile Update Email Notification
    try {
      const emailContent = profileUpdatedEmail(updatedUser);
      await sendEmail({
        to: updatedUser.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (mailErr) {
      console.log("Profile Update Email Note:", mailErr.message);
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};