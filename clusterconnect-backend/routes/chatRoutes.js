const express = require("express");
const { sendMessage, getMessages, getUsers } = require("../controllers/chatController");
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.post("/send-message", auth, asyncHandler(sendMessage));
router.get("/messages/:chatRoom", auth, asyncHandler(getMessages));
router.get("/users", auth, asyncHandler(getUsers));

module.exports = router;

