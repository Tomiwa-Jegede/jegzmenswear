const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");
require("dotenv").config();

const { autoArchiveStaleProducts } = require("./controllers/productsController");
const { deleteStaleUnverifiedSubscribers } = require("./controllers/subscribersController");

const collectionsRouter = require("./routes/collections");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const adminRouter = require("./routes/admin");
const campaignImagesRouter = require("./routes/campaignImages");
const heroImagesRouter = require("./routes/heroImages");
const siteContentRouter = require("./routes/siteContent");
const musicRouter = require("./routes/music");
const ordersRouter = require("./routes/orders");
const flutterwaveRouter = require("./routes/flutterwave");
const subscribersRouter = require("./routes/subscribers");
const discountCodesRouter = require("./routes/discountCodes");
const campaignsRouter = require("./routes/campaigns");

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((u) => u.trim())
  : [];

console.log("[CORS DEBUG] NODE_ENV at runtime:", process.env.NODE_ENV);



const corsOptions =
  process.env.NODE_ENV === "production"
    ? {
        origin: (origin, callback) => {
          console.log("CORS origin received:", JSON.stringify(origin));
          console.log("Allowed origins:", JSON.stringify(allowedOrigins));
          if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          callback(new Error("Not allowed by CORS"));
        },
      }
    : {
        origin: (origin, callback) => {
          console.log("DEV CORS origin received:", JSON.stringify(origin));
          console.log("DEV_ALLOWED_ORIGIN is:", JSON.stringify(process.env.DEV_ALLOWED_ORIGIN));
          if (
            !origin ||
            /^http:\/\/localhost:\d+$/.test(origin) ||
            origin === process.env.DEV_ALLOWED_ORIGIN
          ) {
            return callback(null, true);
          }
          callback(new Error("Not allowed by CORS"));
        },
      };

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "onfleek-backend" });
});

app.use("/api/collections", collectionsRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/admin", adminRouter);
app.use("/api/campaign-images", campaignImagesRouter);
app.use("/api/hero-images", heroImagesRouter);
app.use("/api/site-content", siteContentRouter);
app.use("/api/music", musicRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/flutterwave", flutterwaveRouter);
app.use("/api/subscribers", subscribersRouter);
app.use("/api/discount-codes", discountCodesRouter);
app.use("/api/campaigns", campaignsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }
  if (err.code === "P2002") {
    return res
      .status(409)
      .json({ error: "A record with this value already exists" });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Onfleek backend running on http://localhost:${PORT}`);
  autoArchiveStaleProducts().catch((err) =>
    console.error("[auto-archive] Failed on startup run:", err.message),
  );
});

// Run once daily at midnight server time
cron.schedule("0 0 * * *", () => {
  autoArchiveStaleProducts().catch((err) =>
    console.error("[auto-archive] Failed on scheduled run:", err.message),
  );
});
// Run every 5 minutes to remove unverified subscribers older than 10 minutes
cron.schedule("*/5 * * * *", () => {
  deleteStaleUnverifiedSubscribers().catch((err) =>
    console.error("[stale-subscribers] Failed on scheduled run:", err.message),
  );
});
