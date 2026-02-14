const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const Message = require("./models/Message"); // ✅ import your Message model

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true })); // allow frontend
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ✅ Wrap Express in HTTP server
const http = require("http");
const server = http.createServer(app);

// ✅ Attach Socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// ✅ Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a conversation room
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation ${conversationId}`);
  });

  // Handle sending a message
  socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
    try {
      const message = new Message({ conversationId, sender: senderId, text });
      await message.save();
      await message.populate("sender", "username");

      // Emit to all participants in that conversation
      io.to(conversationId).emit("newMessage", message);

      // ✅ Also emit conversation update (for sidebar unread badges)
      io.to(conversationId).emit("conversationUpdated", { conversationId });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Handle marking messages as read
  socket.on("markRead", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId, sender: { $ne: userId }, read: false },
        { $set: { read: true } }
      );

      // Fetch updated messages
      const updatedMessages = await Message.find({ conversationId })
        .populate("sender", "username");

      // Send updated messages back to participants
      io.to(conversationId).emit("messagesUpdated", updatedMessages);
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  });


  socket.on("disconnect", () => {
    console.log("User disconnected: userId", socket.id);
  });
});

// ✅ MongoDB connection + start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(5000, () => console.log("Server running on http://localhost:5000"));
  })
  .catch(err => console.error(err));
