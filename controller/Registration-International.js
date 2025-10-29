const ForInternationalUsers = require("../models/user");
const errorMessages = require("../errorMessages");
const {
  generateVerificationToken,
} = require("../utils/generateVerificationLink");
const sendVerificationEmail = require("../utils/sendEmail");
const rateLimiter = require("../utils/rateLimiter");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const validCountries = [
  "US",
  "GB",
  "CA",
  "FR",
  "DE",
  "AE",
  "EG",
  "IN",
  "CN",
  "JP",
  "BR",
];

const createdUser = async (req, res) => {
  try {
    const data = req.body;

    // التحقق من الدولة
    if (!data.country)
      return res.status(400).json({ message: errorMessages.COUNTRY_REQUIRED });
    if (["saudi arabia", "sa"].includes(data.country.toLowerCase())) {
      return res.status(400).json({ message: errorMessages.NON_SAUDI_ONLY });
    }
    if (!validCountries.includes(data.country.toUpperCase())) {
      return res.status(400).json({ message: errorMessages.INVALID_COUNTRY });
    }

    // التحقق من الحقول المطلوبة
    const requiredFields = [
      "name.ar",
      "nationalId",
      "country",
      "password",
      "phone",
    ];
    for (const field of requiredFields) {
      if (!field.split(".").reduce((o, i) => (o ? o[i] : null), data)) {
        return res
          .status(400)
          .json({ message: `Field ${field} is required for non-Saudi users` });
      }
    }

    // التحقق من الباسورد
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(data.password)) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_PASSWORD_FORMAT });
    }

    // تحقق الاسم العربي
    if (!/^[\u0600-\u06FF\s]+$/.test(data.name.ar)) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_ARABIC_NAME });
    }

    // تحقق الاسم الإنجليزي
    if (data.name.en && !/^[a-zA-Z\s]+$/.test(data.name.en)) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_ENGLISH_NAME });
    }

    // تحقق الرقم القومي
    if (!/^[0-9]{5,30}$/.test(data.nationalId)) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_NATIONAL_ID });
    }

    // تحقق البريد الإلكتروني
    if (data.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_EMAIL_FORMAT });
    }

    // تحقق الهاتف
    if (data.phone && !/^\+?[0-9]{8,15}$/.test(data.phone)) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_PHONE_FORMAT });
    }

    // تحقق روابط الصور
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|pdf)$/;
    const imageFields = ["nationalIdImageUrl", "ibanImageUrl", "profileImage"];
    for (const field of imageFields) {
      if (data[field] && !urlRegex.test(data[field])) {
        return res
          .status(400)
          .json({ message: errorMessages.INVALID_URL_FORMAT(field) });
      }
    }

    // تحقق IBAN
    if (data.iban && !/^[0-9]{15,34}$/.test(data.iban)) {
      return res
        .status(400)
        .json({ message: errorMessages.INVALID_IBAN_FORMAT });
    }

    // تحقق وجود المستخدم مسبقًا
    const query = { $or: [] };
    if (data.email) query.$or.push({ email: data.email });
    if (data.phone) query.$or.push({ phone: data.phone });
    if (data.nationalId) query.$or.push({ nationalId: data.nationalId });
    if (query.$or.length > 0) {
      const userExists = await ForInternationalUsers.findOne(query);
      if (userExists) {
        let existingFields = [];
        if (data.email && userExists.email === data.email)
          existingFields.push("email");
        if (data.phone && userExists.phone === data.phone)
          existingFields.push("phone");
        if (data.nationalId && userExists.nationalId === data.nationalId)
          existingFields.push("national ID");
        return res
          .status(400)
          .json({ message: errorMessages.USER_ALREADY_EXISTS(existingFields) });
      }
    }

    // // تحقق من rate limiter
    // const rateLimit = await rateLimiter(data.email);
    // if (!rateLimit.allowed) {
    //   return res.status(429).json({ message: errorMessages.TOO_MANY_REQUESTS });
    // }

    // إنشاء المستخدم الجديد
    const newUserData = {
      name: data.name,
      nationalId: data.nationalId,
      country: data.country,
      email: data.email,
      phone: data.phone,
      password: data.password,
      nationalIdImageUrl: data.nationalIdImageUrl,
      iban: data.iban,
      ibanImageUrl: data.ibanImageUrl,
      profileImage: data.profileImage,
      status: "pending",
    };
    const newUser = new ForInternationalUsers(newUserData);
    await newUser.save();

    // توليد رابط التحقق
    const token = generateVerificationToken(newUser._id);
    const verificationLink = `${process.env.BASE_URL}/register/verify-email?token=${token}`;

    // إرسال البريد
    await sendVerificationEmail({
      to: data.email,
      name: data.name.ar,
      verificationLink,
    });

    return res.status(201).json({
      message: "User registered successfully. Verification email sent.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: errorMessages.SERVER_ERROR });
  }
};
// verify email
const verifyEmail = async (req, res) => {
  const token = req.query.token;
  // use IP + token as key
  const clientKey = `${req.ip}_${req.query.token || ""}`;

  const rateLimit = rateLimiter(clientKey);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      message: errorMessages.TOO_MANY_REQUESTS,
      retryAfter: rateLimit.retryAfter,
    });
  }
  if (!token) return res.status(400).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await ForInternationalUsers.findById(decoded.id);
    if (!user)
      return res.status(400).json({ message: errorMessages.USER_NOT_FOUND });

    if (user.emailVerified)
      return res.json({ message: errorMessages.EMAIL_ALREADY_VERIFIED });

    user.emailVerified = true;
    await user.save();

    res.json({ message: errorMessages.EMAIL_VERIFICATION_SUCCESS });
  } catch (error) {
    return res.status(400).json({ message: errorMessages.INVALID_TOKEN });
  }
};
//تغيير حالة المستخدم -للادمن فقط
const ConfirmedUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { loginMethod } = await ForInternationalUsers.findById(id);
    if (loginMethod === "nafath") {
      status = "confirmed";
    }
    let { status } = req.body;
    const user = await ForInternationalUsers.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User status updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addUserByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      city,
      phone,
      country,
      nationalId,
      state,
      address,
      nafathSub,
      bankDetails,
    } = req.body;
    const requiredFields = [
      "name.ar",
      "nationalId",
      "country",
      "password",
      "phone",
    ];
    const data = req.body;
    for (const field of requiredFields) {
      if (!field.split(".").reduce((o, i) => (o ? o[i] : null), data)) {
        return res
          .status(400)
          .json({ message: `Field ${field} is required for non-Saudi users` });
      }
    }
    const query = { $or: [] };
    if (data.email) query.$or.push({ email: data.email });
    if (data.phone) query.$or.push({ phone: data.phone });
    if (data.nationalId) query.$or.push({ nationalId: data.nationalId });
    if (query.$or.length > 0) {
      const userExists = await ForInternationalUsers.findOne(query);
      if (userExists) {
        let existingFields = [];
        if (data.email && userExists.email === data.email)
          existingFields.push("email");
        if (data.phone && userExists.phone === data.phone)
          existingFields.push("phone");
        if (data.nationalId && userExists.nationalId === data.nationalId)
          existingFields.push("national ID");
        return res
          .status(400)
          .json({ message: errorMessages.USER_ALREADY_EXISTS(existingFields) });
      }
    }
    const newUser = new ForInternationalUsers({
      name,
      email,
      password,
      role,
      city,
      phone,
      country,
      nationalId,
      state,
      address,
      nafathSub,
      bankDetails,
      createdByAdmin: true,
    });
    if (newUser.createdByAdmin) {
      newUser.isVerified = true;
      newUser.phoneVerified = true;
      newUser.emailVerified = true;
      newUser.emailVerified = true;
      newUser.status = "confirmed";
    }
    await newUser.save();
    const { password: _pw, ...userData } = newUser.toObject();

    res
      .status(201)
      .json({ message: "user created successfully", user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error occurred while adding user",
      error: err.message,
    });
  }
};

module.exports = {
  createdUser,
  verifyEmail,
  ConfirmedUser,
  addUserByAdmin,
};
