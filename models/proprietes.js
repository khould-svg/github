const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema({
  name: { type: String, required: true }, // اسم العقار أو الصندوق
  location: { type: String, required: true }, // الموقع
  type: {
    type: String,
    enum: ["residential", "commercial", "fund"],
    required: true,
  }, // نوع العقار
  totalValueOwner: { type: Number, required: true }, // القيمة الإجمالية
  totalValueCompany: { type: Number, required: true }, // القيمة الإجمالية
  minInvestment: { type: Number, default: 500.0 }, // الحد الأدنى للاستثمار
  expectedNetYield: { type: Number, required: true }, // العائد الصافي السنوي
  expectedAnnualizedReturn: { type: Number, required: true }, // العائد السنوي من الارتفاع
  holdingPeriodMonths: { type: Number, required: true }, // فترة الاحتجاز
  description: { type: String }, // وصف مفصل
  isRented: { type: Boolean, default: false }, // هل العقار مؤجر؟
  currentRent: { type: Number, default: 0.0 }, // الإيجار الشهري
  images: [{ type: String }], // مصفوفة روابط الصور
  status: {
    type: String,
    enum: ["available", "funded", "matured", "sold"],
    default: "available",
  },
  apartmentNo: { type: Number, required: true }, // رقم الشقة
  NumbersRooms: { type: Number, required: true }, // عدد الغرف
  Numbersbath: { type: Number, required: true }, // عدد الحمامات
  squareFootage: { type: Number, required: true }, // المساحة بالمتر المربع
  progressfunded: {
    type: Number,
    min: 0,
    max: 1, // يعني 100% = 1.0
    required: true
  }, // نسبة البيع
  progressLeasing: {
    type: Number,
    min: 0,
    max: 1, // يعني 100% = 1.0
    required: true
  }, // نسبة الايجار
  totalRevenuePerYear: { type: Number, required: true }, // إجمالي العائد السنوي
  totalRevenuePerFiveYear: { type: Number, required: true }, // إجمالي العائد خلال خمس سنوات
  
  isShariahCompliant: { type: Boolean, default: true }, // متوافق مع الشريعة
  // الحقول الإضافية
  metaTags: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }],
  },
  features: [{ type: String }], // مميزات العقار
  fundedAmount: { type: Number, default: 0.0 }, // المبلغ الممول
  totalShares: { type: Number, required: true }, // إجمالي الأسهم
  remainingShares: {
    type: Number,
    default: function () {
      return this.totalShares;
    },
  }, // الأسهم المتبقية
  rentDistributionFrequency: {
    type: String,
    enum: ["monthly", "quarterly"],
    default: "monthly",
  }, // وتيرة توزيع العوائد
  lastDividendDate: { type: Date }, // آخر تاريخ توزيع عوائد
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number },
  }, // إحداثيات الموقع
  countryCode: { type: String, default: "SA" }, // رمز الدولة
  tenantInfo: {
    name: { type: String },
    leaseStartDate: { type: Date },
    leaseEndDate: { type: Date },
    monthlyRent: { type: Number },
  }, // معلومات المستأجر
  viewCount: { type: Number, default: 0 }, // عدد المشاهدات
  investmentCount: { type: Number, default: 0 }, // عدد المستثمرين
  translations: {
    name: {
      en: { type: String },
      ar: { type: String },
    },
    description: {
      en: { type: String },
      ar: { type: String },
    },
  }, // ترجمات متعددة اللغات
  legalDocuments: [{ type: String }], // روابط الوثائق القانونية
  maturityDate: { type: Date }, // تاريخ النضج
  fundingDeadline: { type: Date }, // الموعد النهائي للتمويل
  status: {
    type: String,
    enum: ["available", "pending", "sold"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// تحديث updatedAt تلقائيًا
propertySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const Propertymodule = mongoose.model("Property", propertySchema);
module.exports = Propertymodule;
