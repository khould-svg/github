const mongoose = required("mongoose");
const walletSchema = new mongoose.Schema({
  blances: [
    {
      currency: {
        type: String,
        enum: ["SAR", "USD", "EGP"],
        default: "SAR",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  userID: {
    type: schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  process: {
    type: String,
    enum: ["deposit", "withdraw", "investment"],
  },
  account: [
    {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        default: "Saudi Arabia",
        required: true,
      },
      IBAN: {
        type: String,
        validate: {
          validator: function (v) {
            return !v || /^[0-9]{15,34}$/.test(v);
          },
          message: (props) => $`{props.value} is not a valid IBAN`,
        },
        required: true,
      },
      currency: {
        type: String,
        default: "SAR",
        required: true,
      },
      AccountNumber: {
        type: Number,
        validate: {
          validator: function (v) {
            return /^[0-9]{8,20}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid Account Number`,
        },
        required: true,
      },
      BankName: {
        type: String,
        required: true,
      },
      branchName: {
        type: String,
        required: true,
      },
      Swiftcode: {
        type: String,
        uppercase: true,
        validate: {
          validator: function (v) {
            return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v);
          },
          message: (props) => `${props.value} is not a valid SWIFT/BIC code`,
        },
        required: true,
      },
    },
  ],
  creditcard: [
    {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      CardNumber: {
        type: Number,
        required: true,
        validate: {
          validator: function (v) {
            return /^[0-9]{13,19}$/.test(v);
          },
          message: (props) =>
            `${props.value} is not a valid credit card number`,
        },
      },
      expireDate: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return validateExpiryDate(v);
          },
          message: (props) =>
            `${props.value} is not a valid expiry date (MM/YY)`,
        },
      },
      CVV: {
        type: Number,
        required: true,
        validate: {
          validator: function (v) {
            return /^[0-9]{3}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid CVV number`,
        },
      },
    },
  ],
});
module.exports = mongoose.model('Wallet',walletSchema);
