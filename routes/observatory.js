const express = require("express");
const { check_body_schema } = require("../utils/services");
const router = express.Router();
const sql = require("mssql");
const dotenv = require('dotenv');
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
    res.json({endpoint: "observatory"})
})

const createBodySchema = {
    name: "string",
    country: 'string',
    latitude: 'number',
    longitude: 'number',
    date_established: 'string'
}

router.post("/create", (req, res) => {
    if (!check_body_schema(req.body, createBodySchema)) {
        res.status(400).send("Invalid request body");
    }
    console.log(req.body);

    sql.connect(config, async err => {
        if (err){
            console.log(err)
        }else{
            sql.query(`INSERT INTO ObservatoryData VALUES (
                '${req.body.name}',
                '${req.body.country}',
                ${req.body.latitude},
                ${req.body.longitude},
                '${req.body.date_established}'
            )`).then(sql_res => {
                console.log(sql_res);
                res.status(200).send();
            }).catch(err => {
                console.log(err);
                res.status(500).send();
            })
        }
    })
})

module.exports = router;
