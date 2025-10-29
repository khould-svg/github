const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // الاسم باللغتين
    name: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, trim: true },
    },

    // الرقم القومي
    nationalId: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => /^[0-9]{5,30}$/.test(v),
        message: (props) => `${props.value} is not a valid National ID`,
      },
    },

    // التسجيل عبر نفاذ (للسعوديين فقط)
    nafathSub: {
      type: String,
      required: function () {
        return (
          this.country?.toLowerCase() === "saudi arabia" ||
          this.country?.toLowerCase() === "sa"
        );
      },
    },

    // كلمة المرور لغير السعوديين
    password: {
      type: String,
      required: function () {
        return !this.nafathSub;
      },
      minlength: 6,
      select: false,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    preferredLanguage: {
      type: String,
      enum: ["ar", "en"],
      default: "ar",
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      validate: {
        validator: function (v) {
          return !v || /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    emailVerified: { type: Boolean, default: false },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (v) {
          return !v || /^\+?[0-9]{8,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    phoneVerified: { type: Boolean, default: false },

    // صور الهوية والآيبان
    nationalIdImageUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|pdf)$/.test(v);
        },
        message: () => "Invalid national ID image URL",
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
    iban: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{15,34}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid IBAN`,
      },
    },

    ibanImageUrl: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|pdf)$/.test(v);
        },
        message: () => "Invalid IBAN image URL",
      },
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    blockedReason: { type: String },

    // معلومات الدخول
    role: {
      type: String,
      enum: ["user", "admin" ,"investor","buyer"],
      default: "user",
    },
    
    lastLogin: { type: Date },
    loginMethod: {
      type: String,
      enum: ["manual", "nafath"],
      default: "manual",
    },

    loginIP: { type: String },
    deviceInfo: { type: String },

    profileImage: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png)$/.test(v);
        },
        message: () => "Invalid profile image URL",
      },
    },

    notes: { type: String },
    createdByAdmin: { type: Boolean, default: false },

    tags: [
      {
        type: String,
        enum: ["vip", "test", "beta", "staff", "investor"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

//hash

userSchema.pre("save", async function (next) {
  // فقط لو الباسورد اتغير أو جديد، نعمل هاش
  if (!this.isModified("password")) {
    return next(); // متعملش حاجة وروّح
  }

  try {
    const salt = await bcrypt.genSalt(10); // ممكن تستخدم genSaltSync بردو
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ دالة مقارنة كلمة المرور
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const usermodule = mongoose.model("User", userSchema);

module.exports = usermodule;
