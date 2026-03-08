const express = require("express");
const { register, login } = require("../controllers/authController");
const { googleLogin } = require("../controllers/GauthController");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/google", asyncHandler(googleLogin));

module.exports = router;
