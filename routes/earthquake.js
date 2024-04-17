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
    res.json({ endpoint: "earthquake" })
})

const createBodySchema = {
    datetime: ["string", true],
    magnitude: ['number', true],
    country: ["string", true],
    latitude: ['number', true],
    longitude: ['number', true],
    observatory_id: ["number", true],
    earthquake_type: ["string", true], //"Tectonic", "Collapse", "Explosion" etc
    seismic_wave_type: ["string", true] //P, S, Love, Rayleigh
}

router.post("/create", (req, res) => {
    if (!check_body_schema(req.body, createBodySchema)) {
        res.status(400).send("Invalid request body");
        return false;
    }

    sql.connect(config, async err => {
        if (err) {
            console.log(err)
        } else {
            sql.query(`INSERT INTO EarthquakeData VALUES (
                '${req.body.datetime}',
                ${req.body.magnitude},
                '${req.body.country}',
                ${req.body.latitude},
                ${req.body.longitude},
                ${req.body.observatory_id},
                '${req.body.earthquake_type}',
                '${req.body.seismic_wave_type}'
            )`).then(_ => {
                res.status(200).send();
                return true;
            }).catch(err => {
                console.log(err);
                res.status(500).send();
                return false;
            })
        }
    })
})

const searchSchema = {
    operator: ["string", true],
    id: ["number", false],
    country: ["string", false],
    earthquake_type: ["string", false],
    start_date: ["string", false],
    end_date: ["string", false],
}
router.get("/search", (req, res) => {
    let search_params = req.body;

    if (!check_body_schema(search_params, searchSchema)) {
        res.status(400).send("Invalid request body - please include an operator (AND or OR) for the search");
        return false;
    }

    let sql_query = [];
    let keys = Object.keys(search_params);

    if (keys.includes("start_date") && keys.includes("end_date")){
        if (new Date(search_params['start_date']) > new Date(search_params['end_date'])){
            res.status(400).send("start date is after end date");
            return false;
        }

        let start_date = search_params['start_date'].split("-").join("-");
        let end_date = search_params['end_date'].split("-").join("-");
        sql_query.push(`(EventDate BETWEEN '${start_date}' AND '${end_date}')`)
    }

    if (keys.includes("magnitude_max") && keys.includes("magnitude_min")){
        sql_query.push(`(magnitude BETWEEN ${search_params['magnitude_min']} AND ${search_params['magnitude_max']})`)
    }

    if (keys.includes("id")){
        sql_query.push(`(id = ${search_params['id']})`);
    }

    if (keys.includes("country")){
        sql_query.push(`(country = '${search_params['country']}')`);
    }

    if (keys.includes("earthquake_type")){
        sql_query.push(`(EarthquakeType = '${search_params['earthquake_type']}')`)
    }

    if (sql_query.length == 0){
        res.status(400).send("no search parameters");
        return false;
    }

    let query = "SELECT * FROM EarthquakeData WHERE " + sql_query.join(` ${search_params['operator']} `);

    sql.connect(config, async err => {
        if (err) {
            console.log(err)
        } else {
            sql.query(query).then(sql_res => {
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