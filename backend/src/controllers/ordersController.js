const https = require("https");
const prisma = require("../lib/prisma");

const DELIVERY_FEE = 3000; // NGN — keep in sync with frontend DELIVERY_FEE constant

const orderInclude = {
  items: {
    include: {
      product: {
        select: { name: true, slug: true },
      },
    },
  },
};

function verifyFlutterwaveTransaction(transactionId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.flutterwave.com",
      path: `/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
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

async function createOrder(req, res, next) {
  try {
    const {
      customerName,
      phoneNumber,
      customerEmail,
      deliveryAddress,
      paymentReference,
      buyNowItem,
    } = req.body;
    if (
      !customerName ||
      !phoneNumber ||
      !customerEmail ||
      !deliveryAddress ||
      !paymentReference
    ) {
      const err = new Error(
        "customerName, phoneNumber, customerEmail, deliveryAddress and paymentReference are required",
      );
      err.status = 400;
      throw err;
    }

    let cart = null;
    let orderItemsSource;

    if (buyNowItem?.variantId) {
      const quantity = Number(buyNowItem.quantity) || 1;
      const variant = await prisma.productVariant.findUnique({
        where: { id: buyNowItem.variantId },
        include: { product: true },
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
      orderItemsSource = [{ variant, quantity }];
    } else {
      cart = await prisma.cart.findUnique({
        where: { sessionId: req.sessionId },
        include: {
          items: { include: { variant: { include: { product: true } } } },
        },
      });

      if (!cart || cart.items.length === 0) {
        const err = new Error("Cart is empty");
        err.status = 400;
        throw err;
      }

      orderItemsSource = cart.items;
    }

    const subtotal = orderItemsSource.reduce(
      (sum, i) => sum + Number(i.variant.product.price) * i.quantity,
      0,
    );
    const totalAmount = subtotal + DELIVERY_FEE;

    const existingOrder = await prisma.order.findUnique({
      where: { paymentReference: String(paymentReference) },
    });
    if (existingOrder) {
      const err = new Error("This payment reference has already been used");
      err.status = 409;
      throw err;
    }

    const verification = await verifyFlutterwaveTransaction(paymentReference);
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
    if (paidAmountNaira < totalAmount - 0.5) {
      const err = new Error("Paid amount does not match order total");
      err.status = 402;
      throw err;
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerName,
          phoneNumber,
          customerEmail,
          deliveryAddress,
          subtotal,
          deliveryFee: DELIVERY_FEE,
          totalAmount,
          paymentReference: String(paymentReference),
          paymentStatus: "PAID",
          orderStatus: "PENDING",
          items: {
            create: orderItemsSource.map((i) => ({
              productId: i.variant.product.id,
              quantity: i.quantity,
              priceAtPurchase: i.variant.product.price,
            })),
          },
        },
        include: orderInclude,
      });

      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return created;
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const { status } = req.query;
    const where = status ? { orderStatus: status } : {};
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
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};