const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/user");
const rateLimiter = require("../utils/rateLimiter");
const errorMessages = require("../errorMessages");
const dotenv = require("dotenv");
dotenv.config();
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: errorMessages.EMAIL_AND_PASSWORD_REQUIRED });
    }

    const foundUser = await Users.findOne({ email }).select(
      "+password +emailVerified"
    );
    if (!foundUser) {
      return res
        .status(401)
        .json({ message: errorMessages.INVALID_EMAIL_OR_PASSWORD });
    }

    if (!foundUser.emailVerified) {
      return res
        .status(403)
        .json({ message: errorMessages.EMAIL_VERIFICATION_REQUIRED });
    }

    // if (!foundUser.phoneVerified) {
    //   return res
    //     .status(403)
    //     .json({ message: errorMessages.PHONE_VERIFICATION_REQUIRED });
    // }

    // const isMatch = await bcrypt.compare(password, foundUser.password);
    // if (!isMatch) {
    //   return res.status(401).json({ message: errorMessages.INVALID_EMAIL_OR_PASSWORD });
    // }

    if (!process.env.JWT_SECRET) {
      throw new Error(errorMessages.JWT_SECRET_NOT_SET);
    }

    const token = jwt.sign(
      { userId: foundUser._id, email: foundUser.email, role: foundUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: errorMessages.LOGIN_SUCCESS,
      token,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      },
    });
    const rateLimit = rateLimiter(email);
    if (!rateLimit.allowed) {
      return res.status(429).json({ message: errorMessages.TOO_MANY_REQUESTS });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: errorMessages.SERVER_ERROR });
  }
};

module.exports = login;
