const crypto = require("crypto");
const prisma = require("../lib/prisma");
const validator = require("validator");
const { addContactToBrevo, sendTransactionalEmail } = require("../lib/brevo");
const { createDiscountCodeForSubscriber } = require("../lib/discountCode");

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function subscribe(req, res, next) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
      const err = new Error("A valid email is required");
      err.status = 400;
      throw err;
    }
    const normalizedEmail = email.trim().toLowerCase();

    let subscriber = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (subscriber?.verified) {
      return res.json({
        success: true,
        alreadySubscribed: true,
        message: "This email is already confirmed.",
      });
    }

    const token = generateToken();

    if (subscriber) {
      subscriber = await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { verificationToken: token },
      });
    } else {
      subscriber = await prisma.subscriber.create({
        data: { email: normalizedEmail, verificationToken: token },
      });
    }

    const verifyUrl = `${req.protocol}://${req.get("host")}/api/subscribers/verify/${token}`;

    await sendTransactionalEmail({
      to: normalizedEmail,
      subject: "Confirm your email",
      htmlContent: `
        <p>Thanks for signing up! Click below to confirm your email and get your discount code.</p>
        <p><a href="${verifyUrl}">Confirm my email</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });

    res.json({
      success: true,
      message: "Check your email to confirm and get your discount code.",
    });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;
    const clientUrl = process.env.CLIENT_URL;

    const subscriber = await prisma.subscriber.findUnique({
      where: { verificationToken: token },
    });

    if (!subscriber) {
      return res.redirect(`${clientUrl}/welcome?error=invalid_or_expired`);
    }

    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { verified: true, verificationToken: null },
    });

    const discountCode = await createDiscountCodeForSubscriber(subscriber.id);

    try {
      await addContactToBrevo(subscriber.email, { DISCOUNT_CODE: discountCode.code });
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { brevoSynced: true },
      });
    } catch (brevoErr) {
      console.error("Brevo sync failed:", brevoErr.message);
    }

    res.redirect(
      `${clientUrl}/welcome?code=${encodeURIComponent(discountCode.code)}&amount=${Number(discountCode.amount)}`,
    );
  } catch (err) {
    next(err);
  }
}

async function listSubscribers(req, res, next) {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(subscribers);
  } catch (err) {
    next(err);
  }
}

module.exports = { subscribe, verifyEmail, listSubscribers };