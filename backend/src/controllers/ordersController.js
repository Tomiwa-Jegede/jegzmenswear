const https = require("https");
const prisma = require("../lib/prisma");

const DELIVERY_FEE = 3000; // NGN — keep in sync with frontend DELIVERY_FEE constant
const FREE_DELIVERY_THRESHOLD = 200000; // NGN — keep in sync with frontend FREE_DELIVERY_THRESHOLD constant

const orderInclude = {
  items: {
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          images: {
            select: { url: true, altText: true },
            orderBy: { position: "asc" },
            take: 1,
          },
        },
      },
    },
  },
};

function verifyFlutterwaveTransactionByRef(txRef) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.flutterwave.com",
      path: `/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function resolveOrderItems(req, buyNowItem) {
  let cart = null;
  let orderItemsSource;

  if (buyNowItem?.variantId) {
    const quantity = Number(buyNowItem.quantity) || 1;
    const variant = await prisma.productVariant.findUnique({
      where: { id: buyNowItem.variantId },
      include: { product: { include: { collection: true } } },
    });
    if (!variant) {
      const err = new Error("Product variant not found");
      err.status = 404;
      throw err;
    }
    if (quantity > variant.stock) {
      const err = new Error(`Only ${variant.stock} in stock for this size`);
      err.status = 409;
      throw err;
    }
    if (variant.product.collection?.slug === "native" && !buyNowItem.measurements) {
      const err = new Error("Measurements are required for this product");
      err.status = 400;
      throw err;
    }
    orderItemsSource = [
      { variant, quantity, measurements: buyNowItem.measurements },
    ];
  } else {
    cart = await prisma.cart.findUnique({
      where: { sessionId: req.sessionId },
      include: {
        items: {
          include: {
            variant: { include: { product: { include: { collection: true } } } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      const err = new Error("Cart is empty");
      err.status = 400;
      throw err;
    }

    const missingMeasurements = cart.items.find(
      (i) =>
        i.variant.product.collection?.slug === "native" && !i.measurements,
    );
    if (missingMeasurements) {
      const err = new Error(
        "Measurements are required for one or more items in your cart",
      );
      err.status = 400;
      throw err;
    }

    orderItemsSource = cart.items.map((i) => ({
      variant: i.variant,
      quantity: i.quantity,
      measurements: i.measurements,
    }));
  }

  return { cart, orderItemsSource };
}

// Called before Flutterwave checkout opens. Locks in delivery details
// against the tx_ref so the order exists even if the browser never
// comes back after payment.
async function createPendingOrder(req, res, next) {
  try {
    const {
      customerName,
      phoneNumber,
      customerEmail,
      fulfillmentMethod,
      deliveryAddress,
      paymentReference, // this is the client-generated tx_ref
      buyNowItem,
      discountCode,
    } = req.body;

    const method = fulfillmentMethod === "PICKUP" ? "PICKUP" : "DELIVERY";

    if (
      !customerName ||
      !phoneNumber ||
      !customerEmail ||
      !paymentReference ||
      (method === "DELIVERY" && !deliveryAddress)
    ) {
      const err = new Error(
        method === "DELIVERY"
          ? "customerName, phoneNumber, customerEmail, deliveryAddress and paymentReference are required"
          : "customerName, phoneNumber, customerEmail and paymentReference are required",
      );
      err.status = 400;
      throw err;
    }

    const existingOrder = await prisma.order.findUnique({
      where: { paymentReference: String(paymentReference) },
    });
    if (existingOrder) {
      const err = new Error("This payment reference has already been used");
      err.status = 409;
      throw err;
    }

    const { orderItemsSource } = await resolveOrderItems(req, buyNowItem);

    const subtotal = orderItemsSource.reduce(
      (sum, i) => sum + Number(i.variant.product.price) * i.quantity,
      0,
    );
    const deliveryFee =
      method === "PICKUP" || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

    let discountAmount = 0;
    let appliedDiscountCode = null;
    if (discountCode) {
      const dc = await prisma.discountCode.findUnique({
        where: { code: String(discountCode).trim().toUpperCase() },
      });
      if (!dc || dc.isUsed) {
        const err = new Error("Invalid or already used discount code");
        err.status = 400;
        throw err;
      }
      discountAmount = subtotal * (Number(dc.percentage) / 100);
      appliedDiscountCode = dc.code;
    }

    const totalAmount = subtotal + deliveryFee - discountAmount;

    const order = await prisma.order.create({
      data: {
        customerName,
        phoneNumber,
        customerEmail,
        fulfillmentMethod: method,
        deliveryAddress: method === "PICKUP" ? null : deliveryAddress,
        subtotal,
        deliveryFee,
        discountAmount,
        appliedDiscountCode,
        totalAmount,
        paymentReference: String(paymentReference),
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        items: {
          create: orderItemsSource.map((i) => ({
            productId: i.variant.product.id,
            quantity: i.quantity,
            priceAtPurchase: i.variant.product.price,
            measurements: i.measurements ?? undefined,
          })),
        },
      },
      include: orderInclude,
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// Shared by both the frontend confirm route and the webhook.
async function verifyAndMarkPaid(order) {
  const verification = await verifyFlutterwaveTransactionByRef(order.paymentReference);

  if (
    verification.status !== "success" ||
    verification.data?.status !== "successful"
  ) {
    const err = new Error("Payment could not be verified");
    err.status = 402;
    throw err;
  }

  if (verification.data.currency !== "NGN") {
    const err = new Error("Payment currency does not match order currency");
    err.status = 402;
    throw err;
  }

  const paidAmountNaira = verification.data.amount;
  if (paidAmountNaira < Number(order.totalAmount) - 0.5) {
    const err = new Error("Paid amount does not match order total");
    err.status = 402;
    throw err;
  }

  if (order.appliedDiscountCode) {
    const lockResult = await prisma.discountCode.updateMany({
      where: { code: order.appliedDiscountCode, isUsed: false },
      data: { isUsed: true, usedAt: new Date(), orderId: order.id },
    });
    if (lockResult.count === 0) {
      console.warn(
        `Discount code ${order.appliedDiscountCode} was already used when confirming order ${order.id}`,
      );
    }
  }

  return prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "PAID" },
    include: orderInclude,
  });
}

// Called by the frontend right after Flutterwave's client-side callback fires.
async function confirmOrder(req, res, next) {
  try {
    const { paymentReference } = req.body;
    if (!paymentReference) {
      const err = new Error("paymentReference is required");
      err.status = 400;
      throw err;
    }

    const order = await prisma.order.findUnique({
      where: { paymentReference: String(paymentReference) },
    });
    if (!order) {
      const err = new Error("Order not found for this payment reference");
      err.status = 404;
      throw err;
    }

    let result = order;
    if (order.paymentStatus !== "PAID") {
      result = await verifyAndMarkPaid(order);
    } else {
      result = await prisma.order.findUnique({
        where: { id: order.id },
        include: orderInclude,
      });
    }

    // Clear the session cart now that payment is confirmed (buy-now orders
    // have no cart, so this is a no-op for them).
    const cart = await prisma.cart.findUnique({ where: { sessionId: req.sessionId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// Server-to-server backup path — fires independently of the customer's browser.
async function handleFlutterwaveWebhook(req, res) {
  try {
    const signature = req.headers["verif-hash"];
    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
      return res.status(401).end();
    }

    const txRef = req.body?.data?.tx_ref;
    if (!txRef) {
      return res.status(400).end();
    }

    const order = await prisma.order.findUnique({
      where: { paymentReference: String(txRef) },
    });

    if (order && order.paymentStatus !== "PAID") {
      await verifyAndMarkPaid(order);
    }

    res.status(200).end();
  } catch (err) {
    console.error("Flutterwave webhook error:", err);
    res.status(200).end(); // ack so Flutterwave doesn't retry forever; error is logged above
  }
}

async function getAllOrders(req, res, next) {
  try {
    const { status } = req.query;
    const where = {
      paymentStatus: "PAID",
      ...(status ? { orderStatus: status } : {}),
    };
    const orders = await prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: orderInclude,
    });
    if (!order) {
      const err = new Error("Order not found");
      err.status = 404;
      throw err;
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { orderStatus } = req.body;
    const allowed = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"];
    if (!allowed.includes(orderStatus)) {
      const err = new Error("Invalid orderStatus value");
      err.status = 400;
      throw err;
    }
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { orderStatus },
      include: orderInclude,
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPendingOrder,
  confirmOrder,
  handleFlutterwaveWebhook,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};