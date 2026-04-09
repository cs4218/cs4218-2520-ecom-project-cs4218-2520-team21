import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
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

  // Serve the built React client in production.
  if (process.env.NODE_ENV === "production") {
    const clientBuildPath = path.resolve("client", "build");
    app.use(express.static(clientBuildPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  }

  // Test-only crash endpoint for recovery testing.
  // Enabled only outside production and protected by a shared token.
  if (process.env.DEV_MODE !== "production") {
    app.post("/test/crash", (req, res) => {
      const expectedToken = "recover-test-token";
      const providedToken = req.get("x-crash-token");

      if (providedToken !== expectedToken) {
        return res.status(403).send({ message: "Forbidden" });
      }

      res.status(202).send({
        message:
          "Crash scheduled. If a process manager is running, the backend should restart.",
      });

      setTimeout(() => {
        process.exit(1);
      }, 100);
    });
  }

  // rest api
  app.get("/", (req, res) => {
    res.send("<h1>Welcome to ecommerce app</h1>");
  });
  return app;
}

export default startExpressApp;
