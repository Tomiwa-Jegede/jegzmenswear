const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const collectionsRouter = require("./routes/collections");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const adminRouter = require("./routes/admin");
const campaignImagesRouter = require("./routes/campaignImages");
const heroImagesRouter = require("./routes/heroImages");
const siteContentRouter = require("./routes/siteContent");
const musicRouter = require("./routes/music");
const ordersRouter = require("./routes/orders");

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
          if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
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
});
