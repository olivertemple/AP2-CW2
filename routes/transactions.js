const express = require("express");
const { check_body_schema } = require("../utils/services");
const router = express.Router();
const sql = require("mssql");
const dotenv = require('dotenv');
const { sendMailOrderConfirmation } = require("../utils/email");

dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

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
            res.status(500).json({message: "Could not connect to server", errors: err});
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
                sql.query(`UPDATE SampleData SET is_sold = 1 WHERE sample_id = ${id}`)


                let sample_req = await sql.query(`SELECT * FROM SampleData WHERE sample_id = ${id}`)
                let sample = sample_req.recordset[0];

                let earthquake_req = await sql.query(`SELECT * FROM EarthquakeData WHERE id = ${sample.earthquake_id}`)
                let earthquake = earthquake_req.recordset[0];

                let item = {
                    earthquake_id: earthquake.id,
                    earthquake_date: earthquake.event_date,
                    collection_date: sample.collection_date,
                    sample_type: sample.sample_type,
                    sample_longitude: sample.longitude,
                    sample_latitude: sample.latitude,
                    sample_country: sample.country,
                    item_value: sample.item_value,
                    observations: sample.observations,
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

            res.status(200).json({message: "Succes", errors: err});
            return true;
        } catch (err) {
            console.log(err)
            res.status(500).json({message: "Server error", errors: err});
            return false;
        }
    })
})

router.post("/create_stripe_session", async (req, res) => {
    try {
        var lineItems = [];
        const items = req.body;
        for (let item of items) {
            lineItems.push({
                price_data: {
                currency: 'eur',
                product_data: {
                    name: item.observations,
                },
                unit_amount_decimal: item.item_value*100,
                },
                quantity: 1,
            })
        }
        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:8100/checkout/success?session_id={CHECKOUT_SESSION_IDAd}',
            cancel_url: 'http://localhost:8100/checkout',
        });
        
        res.status(200).json({checkoutURL: session.url})
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Yeah nah you cant pay for this stuff right now... (Why dont you just steal it?)", errors: err});
        return false;
    }
})

router.get("/transaction_collected", (req, res) => {
    if (!req.query.id) {
        res.status(400).json({message: "No ID sent"});
        return false;
    }

    if (!parseInt(req.query.id, 10)) {
        res.status(400).json({message: "Invalid ID"});
        return false;
    }

    let order_number = req.query.id;

    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        }

        try {
            sql.query(`UPDATE Transactions SET collection_status = 'collected' WHERE order_number = '${order_number}'`)

            let sql_order = await sql.query(`SELECT * FROM Transactions WHERE order_number = '${order_number}'`);
            let orders = sql_order.recordset;

            let order_items = [];

            for (let i in orders){
                let order = orders[i];

                let sample_req = await sql.query(`SELECT * FROM SampleData WHERE sample_id = ${order.sample_id}`)
                let sample = sample_req.recordset[0];

                let earthquake_req = await sql.query(`SELECT * FROM EarthquakeData WHERE id = ${sample.earthquake_id}`)
                let earthquake = earthquake_req.recordset[0];
                
                let item = {
                    earthquake_id: earthquake.id,
                    earthquake_date: earthquake.event_date,
                    collection_date: sample.collection_date,
                    sample_type: sample.sample_type,
                    sample_longitude: sample.longitude,
                    sample_latitude: sample.latitude,
                    sample_country: sample.country,
                    item_value: sample.item_value,
                    observations: sample.observations,
                    shop_description: sample.shop_description,
                    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTe3hKH5U9hzPmkWe9XwVn1Kx0UGI4a54UFk7GYM3x4w&s"
                };
        
                order_items.push(item);
            }

            let email_req = await sql.query(`SELECT email, username FROM users WHERE user_id = ${orders[0].buyer_id}`);
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

            res.status(200).json({message: "Success"});
            return true;
        } catch (err) {
            console.log(err)
            res.status(500).json({message: "Server error", errors: err});
            return false;
        }
    })
})
module.exports = router;