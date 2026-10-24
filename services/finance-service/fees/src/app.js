const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes");
const env = require("./config/env");
const { logger, morganMiddleware, morganJsonMiddleware } = require("./utils/logger");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(express.static("public"));

// Middleware
app.use(helmet());
if (process.env.NODE_ENV === "development")
    app.use(
        cors({
            // preflightContinue: true,
            origin: "http://localhost:3000",
            credentials: true,
        }),
    );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan logging middleware
if (env.NODE_ENV === "development") {
    if (morganMiddleware) {
        app.use(morganMiddleware);
    } else {
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });
    }
} else {
    if (morganJsonMiddleware) {
        app.use(morganJsonMiddleware);
    } else {
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });
    }
}

// API routes - mount all routes under /api
app.use("/api", routes);

// Health check (for load balancers)
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "riatirimba-finance-service",
        env: env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});
console.log("")
// 404 handler - must come before error handler
app.use(notFoundHandler);

// Global error handler - must come last
app.use(errorHandler);

module.exports = app;
