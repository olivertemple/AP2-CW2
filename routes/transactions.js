const express = require("express");
const { check_body_schema } = require("../utils/services");
const router = express.Router();
const sql = require("mssql");
const dotenv = require('dotenv');
const { sendMailOrderConfirmation } = require("../utils/email");


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
    sample_ids: ["object", true]
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
        }

        try {
            let order_number = Math.round(Date.now() + Math.random(), 0)

            let order_items = [];
            for (let sample_id in req.body.sample_ids){
                let id = req.body.sample_ids[sample_id];
                sql.query(`INSERT INTO Transactions VALUES (
                    ${req.body.buyer_id},
                    ${req.body.value},
                    '${req.body.date_of_purchase}',
                    'waiting for collection',
                    ${id},
                    '${order_number}'
                )`)
                sql.query(`UPDATE SampleData SET IsSold = 1 WHERE SampleId = ${id}`)


                let sample_req = await sql.query(`SELECT * FROM SampleData WHERE SampleId = ${id}`)
                let sample = sample_req.recordset[0];

                let earthquake_req = await sql.query(`SELECT * FROM EarthquakeData WHERE Id = ${sample.EarthquakeId}`)
                let earthquake = earthquake_req.recordset[0];

                let item = {
                    earthquake_id: earthquake.Id,
                    earthquake_date: earthquake.EventDate,
                    collection_date: sample.CollectionDate,
                    sample_type: sample.SampleType,
                    sample_longitude: sample.Longitude,
                    sample_latitude: sample.Latitude,
                    sample_country: sample.Country,
                    item_value: sample.ItemValue,
                    observations: sample.Observations,
                    shop_description: sample.shop_description,
                    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTe3hKH5U9hzPmkWe9XwVn1Kx0UGI4a54UFk7GYM3x4w&s"
                };

                order_items.push(item);
            }
            let email_req = await sql.query(`SELECT email, username FROM users WHERE user_id = ${req.body.buyer_id}`);
            let email = email_req.recordset[0].email;
            let username = email_req.recordset[0].username;


            sendMailOrderConfirmation(
                email,
                username,
                order_number,
                order_items,
                'confirmation',
                req.body.date_of_purchase
            )

            res.status(200).send();
            return true;
        } catch (err) {
            console.log(err)
            res.status(500).send(err);
            return false;
        }
    })
})

router.get("/transaction_collected", (req, res) => {
    if (!req.query.id) {
        res.status(400).send("no id sent");
        return false;
    }

    if (!parseInt(req.query.id, 10)) {
        res.status(400).send("invalid id");
        return false;
    }

    let order_number = req.query.id;

    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
            return false;
        }

        try {
            sql.query(`UPDATE Transactions SET collection_status = 'collected' WHERE order_number = '${order_number}'`)

            let sql_order = await sql.query(`SELECT * FROM Transactions WHERE order_number = '${order_number}'`);
            let orders = sql_order.recordset;

            let order_items = [];

            for (let i in orders){
                let order = orders[i];

                let sample_req = await sql.query(`SELECT * FROM SampleData WHERE SampleId = ${order.SampleId}`)
                let sample = sample_req.recordset[0];

                let earthquake_req = await sql.query(`SELECT * FROM EarthquakeData WHERE Id = ${sample.EarthquakeId}`)
                let earthquake = earthquake_req.recordset[0];
                
                let item = {
                    earthquake_id: earthquake.Id,
                    earthquake_date: earthquake.EventDate,
                    collection_date: sample.CollectionDate,
                    sample_type: sample.SampleType,
                    sample_longitude: sample.Longitude,
                    sample_latitude: sample.Latitude,
                    sample_country: sample.Country,
                    item_value: sample.ItemValue,
                    observations: sample.Observations,
                    shop_description: sample.shop_description,
                    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTe3hKH5U9hzPmkWe9XwVn1Kx0UGI4a54UFk7GYM3x4w&s"
                };
        
                order_items.push(item);
            }

            let email_req = await sql.query(`SELECT email, username FROM users WHERE user_id = ${orders[0].BuyerId}`);
            let email = email_req.recordset[0].email;
            let username = email_req.recordset[0].username;

            sendMailOrderConfirmation(
                email,
                username,
                order_number,
                order_items,
                'collection',
                orders[0].date_of_purchase
            )

            res.status(200).send();
            return true;
        } catch (err) {
            console.log(err)
            res.status(500).send(err);
            return false;
        }
    })
})
module.exports = router;