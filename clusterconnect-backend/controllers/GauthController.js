const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { findUserByEmail, createUser } = require("../models/userModel");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function googleLogin(req, res) {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    console.log("🔍 Google login for:", email);

    let user = await findUserByEmail(email);

    if (!user) {
      console.log("📝 Creating new user:", email);
      user = await createUser(email, name, null);
    }

    if (!user || !user._id) {
      console.error("❌ User creation/retrieval failed");
      return res.status(500).json({ message: "Failed to create user" });
    }

    console.log("✅ User found/created:", user);

    const appToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: appToken, user: { ...user, id: user._id } });

  } catch (err) {
    console.error("❌ Google auth error:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
}

module.exports = { googleLogin };
