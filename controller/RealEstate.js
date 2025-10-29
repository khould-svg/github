const RealEstate = require("../models/proprietes");
const errorMessages = require("../errorMessages");
const { io } = require("../index"); // استدعاء io

// إضافة عقار جديد - للأدمن فقط
exports.createRealEstate = async (req, res) => {
  try {
    const {
      name,
      location,
      type,
      totalValue,
      minInvestment,
      expectedNetYield,
      expectedAnnualizedReturn,
      holdingPeriodMonths,
      description,
      images,
      totalShares,
      features,
      isRented,
      currentRent,
    } = req.body;

    const userId = req.user.id;

    const newProperty = new RealEstate({
      name,
      location,
      type,
      totalValue,
      minInvestment,
      expectedNetYield,
      expectedAnnualizedReturn,
      holdingPeriodMonths,
      description,
      images,
      totalShares,
      features,
      isRented,
      currentRent,
      listedBy: userId,
    });

    await newProperty.save();

     //333333 خطوه   
    // إرسال إشعار لكل المستخدمين المتصلين
    io.emit("newProperty", {
      message: "تم إضافة عقار جديد 🎉",
      property: newProperty
    });


    res
      .status(201)
      .json({
        message: "Property created successfully",
        property: newProperty,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// تعديل عقار - للأدمن فقط
exports.updateRealEstate = async (req, res) => {
  try {
    const { id } = req.params; // ID العقار من البارامز
    const updates = req.body; // البيانات الجديدة من البودي

    const updatedProperty = await RealEstate.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// status
exports.updateStatus = async (req, res) => {
  if (!req.user.role === "admin") {
    return res.status(403).json({ message: errorMessages.UNAUTHORIZED });
  }
  if (!req.body.status) {
    return res.status(400).json({ message: errorMessages.STATUS_REQUIRED });
  }
  if (!["available", "pending", "sold"].includes(req.body.status)) {
    return res.status(400).json({ message: errorMessages.INVALID_STATUS });
  }
  if (!req.params.id) {
    return res
      .status(400)
      .json({ message: errorMessages.PROPERTY_ID_REQUIRED });
  }
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedProperty = await RealEstate.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Property status updated successfully",
      property: updatedProperty,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// حذف عقار - للأدمن فقط
exports.deleteRealEstate = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProperty = await RealEstate.findByIdAndDelete(id);

    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// عرض جميع العقارات
exports.getAllRealEstates = async (req, res) => {
  try {
    const properties = await RealEstate.find();
    res.status(200).json({ properties });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// عرض عقار واحد
exports.getOneRealEstate = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await RealEstate.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// البحث بالاسم والمكان
exports.searchProperty = async (req, res) => {
    const { q } = req.query;
    try {
        const property = await RealEstate.find({
            $or: [
                { name: { $regex: q, $options: "i" } }, 
                { location: { $regex: q, $options: "i" } },
            ],
        });

        if (property.length === 0) {
            return res.status(404).json({ message: " Sorry Sir, No property match your search" });
        }

        return res.status(200).json(property);
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Search failed", error: error.message });
    }
};
// تصفية العقارات حسب السعر
exports.filterByPrice = async (req, res) => {
  let { minPrice, maxPrice } = req.query;

  // تحويل القيم لأرقام والتأكد إنها صالحة
  minPrice = minPrice ? Number(minPrice) : null;
  maxPrice = maxPrice ? Number(maxPrice) : null;

  const filter = {};

  if (minPrice !== null && maxPrice !== null) {
    filter.totalValue = { $gte: minPrice, $lte: maxPrice };
  } else if (minPrice !== null) {
    filter.totalValue = { $gte: minPrice };
  } else if (maxPrice !== null) {
    filter.totalValue = { $lte: maxPrice };
  }

  try {
    const property = await RealEstate.find(filter);
    if (!property || property.length === 0) {
      return res.status(404).json({ message: "Sorry Sir, No property found in this price range" });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({
      message: "Error filtering property by price",
      error: error.message,
    });
  }
};
