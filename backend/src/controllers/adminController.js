const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      const err = new Error("Username and password are required");
      err.status = 400;
      throw err;
    }

    if (username !== process.env.ADMIN_USERNAME) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    const matches = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH,
    );
    if (!matches) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    const token = jwt.sign(
      { role: "admin", username },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      },
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
}

function getCloudinarySignature(req, res, next) {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp },
      process.env.CLOUDINARY_API_SECRET,
    );
    res.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, getCloudinarySignature };
