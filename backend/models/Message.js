const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, default: "" }, // Made optional
  fileUrl: { type: String, default: "" }, // ✅ new field
  fileName: { type: String, default: "" }, // ✅ new field
  fileType: { type: String, default: "" }, // ✅ new field
  read: { type: Boolean, default: false }   // ✅ new field
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);