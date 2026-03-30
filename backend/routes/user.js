const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate unique name
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

const router = express.Router();

// Search users by username or email
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query; // search query
    if (!q) return res.status(400).json({ msg: "Search query required" });

    // Case-insensitive search
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    }).select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Create or get a conversation with a user
router.post("/conversations", authMiddleware, async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user, recipientId] }
    }).populate("participants", "username email avatar");

    // If not, create new
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user, recipientId]
      });
      await conversation.save();
      await conversation.populate("participants", "username email avatar");
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Send a message
router.post("/messages", authMiddleware, async (req, res) => {
  try {
    const { conversationId, text, fileUrl, fileName, fileType } = req.body;

    const message = new Message({
      conversationId,
      sender: req.user,   // comes from authMiddleware
      text,
      fileUrl,
      fileName,
      fileType
    });

    await message.save();

    // ✅ Add this line before sending response
    await message.populate("sender", "username avatar");

    res.json(message);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Upload file endpoint
router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      fileUrl, 
      fileName: req.file.originalname, 
      fileType: req.file.mimetype 
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Server error during upload" });
  }
});



// Get messages in a conversation
router.get("/messages/:conversationId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate("sender", "username avatar"); // ensures sender has { _id, username, avatar }
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Mark all messages in a conversation as read
router.put("/messages/read/:conversationId", authMiddleware, async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.conversationId, sender: { $ne: req.user }, read: false },
      { $set: { read: true } }
    );
    res.json({ msg: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});



// ✅ Get all conversations for logged-in user
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user })
      .populate("participants", "username email avatar")
      .lean();

    // Add unread count for each conversation
    for (let conv of conversations) {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        read: false,
        sender: { $ne: req.user }   // only count messages from others
      });
      conv.unreadCount = unreadCount;
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});



const bcrypt = require("bcryptjs");

// ✅ Update profile endpoint
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    const userToUpdate = await User.findById(req.user);
    
    if (!userToUpdate) return res.status(404).json({ msg: "User not found" });

    if (username) userToUpdate.username = username;
    if (email) userToUpdate.email = email;
    if (avatar !== undefined) userToUpdate.avatar = avatar;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      userToUpdate.password = await bcrypt.hash(password, salt);
    }

    await userToUpdate.save();

    res.json({
      _id: userToUpdate._id,
      username: userToUpdate.username,
      email: userToUpdate.email,
      avatar: userToUpdate.avatar
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ msg: "Server error during profile update" });
  }
});

module.exports = router;