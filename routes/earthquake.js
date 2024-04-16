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
    res.json({endpoint: "earthquake"})
})

const createBodySchema = {
    datetime: "string",
    magnitude: 'number',
    country: "string",
    latitude: 'number',
    longitude: 'number',
    observatory_id: "number",
    earthquake_type: "string", //"Tectonic", "Collapse", "Explosion" etc
    seismic_wave_type: "string" //P, S, Love, Rayleigh
}

router.post("/create", (req, res) => {
    if (!check_body_schema(req.body, createBodySchema)) {
        res.status(400).send("Invalid request body");
    }

    sql.connect(config, async err => {
        if (err){
            console.log(err)
        }else{
            sql.query(`INSERT INTO EarthquakeData VALUES (
                '${req.body.datetime}',
                ${req.body.magnitude},
                '${req.body.country}',
                ${req.body.latitude},
                ${req.body.longitude},
                ${req.body.observatory_id},
                '${req.body.earthquake_type}',
                '${req.body.seismic_wave_type}'
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