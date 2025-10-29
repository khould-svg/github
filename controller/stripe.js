  // controllers/paymentController.js
  const Stripe = require("stripe");
  require("dotenv").config();
  const Payout = require('../models/payout');

  const stripe = Stripe(process.env.STRIPE_SECRET);


  const createCheckoutSession = async (req, res) => {
    try {
      const { amount } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Custom Payment" },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: error.message });
    }
  };

  // ==================== 2- إنشاء Stripe Account ====================

  const payoutToBankController = async (req, res) => {
    try {
      const { fullName, country, iban, amount, email } = req.body;

      if (!fullName || !country || !iban || !amount || !email) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const account = await stripe.accounts.create({
        type: 'custom',
        country: country,
        email: email,
        business_type: 'individual',
        individual: {
          first_name: fullName,
          last_name: '-',
          id_number: '0000000000' // لو محتاج National ID
        },
        capabilities: {
          transfers: { requested: true } // يسمح بالتحويل
        },
      });

      const bankAccount = await stripe.accounts.createExternalAccount(
        account.id,
        {
          external_account: {
            object: 'bank_account',
            country: country,
            currency: 'usd',
            account_number: iban,
            account_holder_name: fullName,
          }
        }
      );
      const payout = await stripe.payouts.create(
        {
          amount: amount * 100,
          currency: 'usd',
        },
        {
          stripeAccount: account.id
        }
      );

      // 4️⃣ حفظ العملية في MongoDB
      const newPayout = new Payout({
        fullName,
        country,
        iban,
        amount,
        stripeAccountId: account.id,
        payoutId: payout.id,
        status: payout.status
      });

      await newPayout.save();

      res.status(200).json({
        message: "Payout successful",
        payoutId: payout.id,
        stripeAccountId: account.id,
        status: payout.status
      });

    } catch (error) {
      console.error('Error creating payout:', error);
      res.status(500).json({ error: error.message });
    }
  };
  module.exports = {
    createCheckoutSession,
  payoutToBankController
  };
