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

    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser(email, name);
    }

    const appToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: appToken, user });

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Google authentication failed" });
  }
}

module.exports = { googleLogin };
