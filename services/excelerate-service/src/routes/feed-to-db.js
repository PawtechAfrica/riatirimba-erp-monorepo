// const express = require("express");
// const multer = require("multer");
// const axios = require("axios");
// const { importExcel } = require("../services/excel");

// const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// router.post("/upload-excel", upload.single("file"), async (req, res) => {
//     try {
//         const { period, year } = req.body;
//         const count = await importExcel(req.file.path);

//     let final = Object.values(count).flat()
//     let data = { period, year, final }

//         try {
//             const url =
//                 process.env.NODE_ENV === "development"
//                     ? "http://localhost:5002/api/v1/students/migrate-excel"
//                     : "http://students-service:5002/api/v1/students/migrate-excel";
//             let resp = await axios.post(url, data);
//             res.json({ messsage: "Successful Exceleration", resp });
//             // res.json( data )
//         } catch (error) {
//             let { message } = error;
//             res.json({ message });
//         }

//         // res.json( Object.values(count) );
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// });

// module.exports = router;

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const { importExcel } = require("../services/excel");

const router = express.Router();
const upload = multer({ dest: "uploads/" });


router.post("/upload-excel", upload.single("file"), async (req, res) => {
    try {
        const { period, year } = req.body;

        const count = await importExcel(req.file.path);
        let final = Object.values(count).flat();
        let data = { period, year, final };

        try {
            const url =
                process.env.NODE_ENV === "development"
                    ? "http://localhost:5002/api/v1/students/migrate-excel"
                    : "http://students-service:5002/api/v1/students/migrate-excel";
            let resp = await axios.post(url, data);

            console.log("Response: ", resp.data);

            // res.json({ messsage: "Successful Exceleration", resp });
            res.json(resp.data);
            // res.json( data )
        } catch (error) {
            let { message } = error;
            res.json({ message });
        }

        // res.json( Object.values(count) );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;


