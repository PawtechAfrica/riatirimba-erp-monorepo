require("dotenv").config();

const express = require("express");
const app = express();
// const db = require('./Database/models')
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const PORT = process.env.PORT || 5005;

const feed_to_db = require("./routes/feed-to-db");

if (process.env.NODE_ENV === "development") {
    app.use(
        cors({
            origin: ["http://localhost:4173", "http://localhost:3000"],
            credentials: true,
            preflightContinue: true,
            optionsSuccessStatus: 200,
            methods: ["POST", "GET", "PUT", "DELETE"],
        }),
    );
}
app.use(express.json());
app.use("/api/v1", feed_to_db);

app.get("/", (req, res) => {
    res.json({ successMessage: "Excelerate Service Active" });
});

// db.sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Successful Connection to Students Database ')
//     return db.sequelize.sync()
//   })
//   .then(() => {
app.listen(PORT, () => {
    console.log("Excelerate Service Active -", PORT);
});
//   })
//   .catch(err => {
//     console.log(err)
//   })
