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
    name: ["string", true],
    country: ['string', true],
    latitude: ['number', true],
    longitude: ['number', true],
    date_established: ['string', true]
}

router.post("/create", (req, res) => {
    if (!check_body_schema(req.body, createBodySchema)) {
        res.status(400).send("Invalid request body");
    }

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
            )`).then(_ => {
                res.status(200).send();
            }).catch(err => {
                console.log(err);
                res.status(500).send();
            })
        }
    })
})

router.get("/largest_magnitude", (req, res) => {
    if (!req.query.id){
        res.status(400).send("no id sent");
        return false;
    }
    let observatory_id = req.query.id;
    sql.connect(config, async err => {
        if (err){
            console.log(err)
            res.status(500).send();
            return false;
        }else{
            sql.query(`SELECT * from EarthquakeData e WHERE e.magnitude = (SELECT MAX(magnitude) FROM EarthquakeData WHERE ObservatoryId = ${observatory_id}) `).then(sql_res => {
                if (sql_res.recordset.length == 0){
                    res.status(400).send(`No earthquakes found with observatory id of ${observatory_id}`);
                    return false;
                }
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                console.log(err);
                res.status(500).send();
                return false;
            })
        }
    })

})

module.exports = router;
