import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";

function startExpressApp(/** @type {() => Promise<void>}*/ connectDB) {
  // configure env
  dotenv.config();

  //database config
  connectDB();

  const app = express();

  //middlewares
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(morgan("dev"));

  //routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/category", categoryRoutes);
  app.use("/api/v1/product", productRoutes);

  // rest api
  app.get("/", (req, res) => {
    res.send("<h1>Welcome to ecommerce app</h1>");
  });
  return app;
}

export default startExpressApp;
