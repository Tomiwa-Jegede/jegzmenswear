const prisma = require("../lib/prisma");

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  },
};

async function getCart(req, res, next) {
  try {
    const cart = await prisma.cart.findUnique({
      where: { sessionId: req.sessionId },
      include: cartInclude,
    });
    res.json(cart || { id: null, sessionId: req.sessionId, items: [] });
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const { variantId, quantity = 1 } = req.body;
    if (!variantId || quantity < 1) {
      const err = new Error("variantId and a positive quantity are required");
      err.status = 400;
      throw err;
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      const err = new Error("Variant not found");
      err.status = 404;
      throw err;
    }

    const cart = await prisma.cart.upsert({
      where: { sessionId: req.sessionId },
      update: {},
      create: { sessionId: req.sessionId },
    });

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    const desiredQty = (existing?.quantity || 0) + quantity;
    if (desiredQty > variant.stock) {
      const err = new Error(`Only ${variant.stock} in stock for this size`);
      err.status = 409;
      throw err;
    }

    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      update: { quantity: desiredQty },
      create: { cartId: cart.id, variantId, quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: cartInclude,
    });
    res.status(201).json(updatedCart);
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, variant: true },
    });
    if (!item || item.cart.sessionId !== req.sessionId) {
      const err = new Error("Cart item not found");
      err.status = 404;
      throw err;
    }

    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (quantity > item.variant.stock) {
        const err = new Error(
          `Only ${item.variant.stock} in stock for this size`,
        );
        err.status = 409;
        throw err;
      }
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: item.cartId },
      include: cartInclude,
    });
    res.json(updatedCart);
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item || item.cart.sessionId !== req.sessionId) {
      const err = new Error("Cart item not found");
      err.status = 404;
      throw err;
    }
    await prisma.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: item.cartId },
      include: cartInclude,
    });
    res.json(updatedCart);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem };
