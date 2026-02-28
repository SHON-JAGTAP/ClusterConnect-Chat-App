const express = require("express");
const { sendMessage, getMessages, getUsers } = require("../controllers/chatController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-message", auth, sendMessage);
router.get("/messages/:chatRoom", auth, getMessages);
router.get("/users", auth, getUsers);

module.exports = router;

