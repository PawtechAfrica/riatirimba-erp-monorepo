require("dotenv").config();

const express = require("express");
const app = express();
const { sequelize } = require("../Database/models");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middlwares/errorHandler");

const PORT = process.env.AUTH_PORT || 4000;

if (process.env.NODE_ENV === "development") {
    app.use(
        cors({
            origin: ["http://localhost:3000"],
            credentials: true,
        }),
    );
}

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);

app.use("/api/permissions", require("./routes/permissions"));
app.use("/api/users", require("./routes/users"));
app.use("/api/roles", require("./routes/roles"));

app.get("/", (req, res) => {
    res.send("AUTH is Active");
});

app.use(errorHandler);
sequelize
    .authenticate()
    .then(() => {
        console.log("✅ Database connected successfully.");

        const forceSync = process.env.SYNC_FORCE === "true";
        return sequelize.sync({ force: forceSync });
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Auth service running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Unable to connect to the database:", err.message);
        process.exit(1);
    });

// const bcrypt = require('bcrypt');

// (async () => {
//   const hash = await bcrypt.hash('password123', 10);
//   console.log("Hashed password:", hash);
// })();
