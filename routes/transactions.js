const express = require("express");
const { check_body_schema } = require("../utils/services");
const router = express.Router();
const sql = require("mssql");
const dotenv = require('dotenv');
const { sendMailOrderConfimation } = require("../utils/email");


dotenv.config();

var config = {
    "user": process.env.USER, // Database username
    "password": process.env.PASSWORD, // Database password
    "server": process.env.SERVER, // Server IP address
    "database": process.env.DATABASE, // Database name
    "options": {
        "encrypt": false, // Disable encryption
        "trustServerCertificate": false
    },
}

router.get("/", (req, res) => {
    res.json({ endpoint: "transactions" })
})


const addTransactionSchema = {
    buyer_id: ["number", true],
    value: ["number", true],
    date_of_purchase: ["string", true],
    sample_id: ["number", true]
}
router.post("/add_transaction", (req, res) => {
    let search_params = req.body;

    let errors = check_body_schema(search_params, addTransactionSchema);

    if (errors.length > 0) {
        res.status(400).json({ message: "Invalid request body", errors: errors });
        return false;
    }

    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
            return false;
        } else {
            sql.query(`INSERT INTO Transactions VALUES (
                ${req.body.buyer_id},
                ${req.body.value},
                '${req.body.date_of_purchase}',
                'waiting for collection',
                ${req.body.sample_id}
            )`).then(async _ => {
                try{
                    let email_req = await sql.query(`SELECT email, username FROM users WHERE user_id = ${req.body.buyer_id}`);
                    let email = email_req.recordset[0].email;
                    let username = email_req.recordset[0].username;
    
                    let sample_req = await sql.query(`SELECT * FROM SampleData WHERE SampleId = ${req.body.sample_id}`)
                    let sample = sample_req.recordset[0];
    
                    let earthquake_req = await sql.query(`SELECT * FROM EarthquakeData WHERE Id = ${sample.EarthquakeId}`)
                    let earthquake = earthquake_req.recordset[0];
                    sendMailOrderConfimation(
                        email,
                        username,
                        1,
                        sample.EarthquakeId,
                        earthquake,
                        sample.Observations,
                        sample.ItemValue,
                        sample.ItemValue,
                        req.body.date_of_purchase,
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTe3hKH5U9hzPmkWe9XwVn1Kx0UGI4a54UFk7GYM3x4w&s"
                    )
                    res.status(200).send();
                    return true;
                }catch (err) {
                    res.status(500).send(err);
                    return false;
                }
                
            }).catch(err => {
                res.status(500).send(err);
                return false;
            })
        }
    })
})

router.post("/update_transaction", (req, res) => {

})
module.exports = router;