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
    res.json({endpoint: "specimens"})
})

const createBodySchema = {
    EarthquakeId: ["number", true],
    CollectionDate: ['string', true],
    SampleType: ["string", true],
    Longitude: ['number', true],
    Latitude: ['number', true],
    Country: ["string", true],
    CurrentLocation: ["string", true],
    Observations: ["string", true]
}

const IsSampleRequired = true
const ItemValue = 0
const IsSold = false

router.post("/create", (req, res) => {
    let errors = check_body_schema(req.body, createBodySchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }
    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
        } else {
            try{

                sql.query(`INSERT INTO SampleData VALUES (
                    '${req.body.EarthquakeId}',
                    '${req.body.CollectionDate}',
                    '${req.body.SampleType}',
                    '${req.body.Longitude}',
                    '${req.body.Latitude}',
                    '${req.body.Country}',
                    '${req.body.CurrentLocation}',
                    '${IsSampleRequired}',
                    '${ItemValue}',
                    '${IsSold}',
                    '${req.body.Observations}'
                )`).then(_ => {
                    res.status(200).send("Specimen added");
                    return true;
                }).catch(err => {
                    res.status(500).send(`could not add specimen, ${err}`);
                    return false;
                })
            } catch (err) {
                res.status(500).send(err);
            }
            
        }
    })

})

module.exports = router;