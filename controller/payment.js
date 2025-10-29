const axios = require('axios');
const Payment = require('../models/payment');

// Moyasar API
const MOYASAR_API_KEY = process.env.MOYASAR_API_KEY; // حط هنا Sandbox Key
const MOYASAR_BASE_URL = 'https://api.moyasar.com/v1';

// -----------------------------
// Helper لإعداد Authorization Header
// -----------------------------
const getAuthHeaders = () => ({
  Authorization: `Basic ${Buffer.from(MOYASAR_API_KEY + ':').toString('base64')}`,
  'Content-Type': 'application/json'
});

// -----------------------------
// إنشاء دفع جديد
// -----------------------------
exports.createPayment = async (req, res) => {
  try {
    const { amount, currency = 'SAR', description = 'Payment for service' } = req.body;

    const response = await axios.post(`${MOYASAR_BASE_URL}/payments`, {
      amount: amount * 100,
      currency,
      description,
      callback_url: 'https://yourdomain.com/payments/webhook',
      source: {
        type: 'creditcard',
        name: req.body.name,
        number: req.body.number,
        month: req.body.month,
        year: req.body.year,
        cvc: req.body.cvc
      }
    }, { headers: getAuthHeaders() });

    const payment = response.data;

    // ✅ حفظ البيانات في MongoDB
    let newPayment = new Payment({
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      status: payment.status,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    });
    await newPayment.save();

    // إرسال الرد للمستخدم
    res.json({
      id: payment.id,
      checkout_url: payment.checkout_url,
      status: payment.status
    });

  } catch (error) {
    console.error('❌ Moyasar error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
};


// -----------------------------
// تأكيد الدفع
// -----------------------------


// -----------------------------
// Webhook من Moyasar
// -----------------------------
