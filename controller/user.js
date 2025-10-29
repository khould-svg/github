const usermodule = require("../models/user");
const { createToken } = require("../utils/jwt");

// الحصول على جميع المستخدمين
exports.getusers = async (req, res) => {
  try {
    // استعلام لجلب كل المستخدمين من قاعدة البيانات
    var users = await usermodule.find();
    // إرسال قائمة المستخدمين مع كود 200 (نجاح)
    res.status(200).send(users);
  } catch (err) {
    // في حال حدوث خطأ إرسال رسالة خطأ مع كود 500
    res.status(500).send({ message: "Something went wrong" });
  }
};

// تسجيل مستخدم جديد
exports.createUser = async (req, res) => {
  try {
    // استخراج البيانات من جسم الطلب
    const {
      name,
      email,
      password,
      phonenumber,
      city,
      country,
      nationalId,
      role,
      nafathSub,
    } = req.body;

    // التحقق من وجود مستخدم بنفس الإيميل أو رقم الهاتف أو الرقم القومي
    const existing = await usermodule.findOne({
      $or: [{ email }, { phone: phonenumber }, { nationalId }],
    });

    // إذا المستخدم موجود بالفعل نعيد رسالة خطأ مع كود 400
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // إنشاء كائن مستخدم جديد
    const newUser = new usermodule({
      name,
      email,
      password, // سيتم تشفير كلمة المرور تلقائيًا في الموديل
      phone: phonenumber,
      city,
      country,
      nationalId,
      role,
      nafathSub,
      status: "pending",
    });

    // حفظ المستخدم الجديد في قاعدة البيانات
    await newUser.save();

    // إزالة كلمة المرور من بيانات الاستجابة للحماية
    const { password: _pw, ...userData } = newUser.toObject();

    // إعادة رسالة نجاح مع بيانات المستخدم بدون كلمة المرور
    res.status(201).json({ message: "User created", user: userData });
  } catch (err) {
    // في حال حدوث خطأ إعادة رسالة الخطأ مع كود 500
    res.status(500).json({ message: err.message });
  }
};

// تسجيل الدخول
exports.login_user = async (req, res) => {
  // استخراج البريد الإلكتروني وكلمة المرور من جسم الطلب
  const { email, password } = req.body;

  // التحقق من إدخال البريد الإلكتروني وكلمة المرور
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  // البحث عن المستخدم بواسطة البريد الإلكتروني مع تضمين كلمة المرور (مخفية افتراضيًا)
  const user = await usermodule.findOne({ email }).select("+password");

  // إذا المستخدم غير موجود، نرسل رسالة خطأ 404
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // التحقق من صحة كلمة المرور باستخدام الدالة المعرفة في الموديل
  const isValid = await user.matchPassword(password);

  // إذا كانت كلمة المرور غير صحيحة نرسل رسالة خطأ 401
  if (!isValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // إنشاء توكن JWT يحمل الـ id والدور الخاص بالمستخدم
  const token = createToken({ id: user._id, name: user.name, role: user.role });

  // إرسال الاستجابة مع التوكن وبيانات المستخدم الأساسية بدون كلمة المرور
  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// تعديل بيانات مستخدم
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // ID المستخدم من البارامز
    const updates = req.body; // البيانات الجديدة من البودي

    const updatedUser = await usermodule
      .findByIdAndUpdate(id, updates, { new: true })
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// حذف مستخدم
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await usermodule.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.UserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body.status;
    const { loginMethod } = await usermodule.findById(id);
    if (loginMethod === "nafath") {
      status = "confirmed";
    }
    const user = await usermodule.findByIdAndUpdate(
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
