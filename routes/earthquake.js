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
    let errors = check_body_schema(req.body, createBodySchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
            return false;
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
                res.status(500).send(err);
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
    magnitude_max: ["number", false],
    magnitude_min: ["number", false]
}
router.get("/search", (req, res) => {
    let search_params = req.body;

    let errors = check_body_schema(search_params, searchSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    let sql_query = [];
    let keys = Object.keys(search_params);

    if ((keys.includes("start_date") && !keys.includes("end_date")) || (!keys.includes("start_date") && keys.includes("end_date"))){
        res.status(400).send("if one of start_date or end_date is present then both are required");
        return false
    }
    if (keys.includes("start_date") && keys.includes("end_date")) {
        if (new Date(search_params['start_date']) > new Date(search_params['end_date'])) {
            res.status(400).send("start date is after end date");
            return false;
        }

        let start_date = search_params['start_date'].split("-").join("-");
        let end_date = search_params['end_date'].split("-").join("-");
        sql_query.push(`(EventDate BETWEEN '${start_date}' AND '${end_date}')`);
    }

    if ((keys.includes("magnitude_max") && !keys.includes("magnitude_min")) || (!keys.includes("magnitude_max") && keys.includes("magnitude_min"))){
        res.status(400).send("if one of magnitude_max or magnitude_min is present then both are required");
        return false;
    }

    if (keys.includes("magnitude_max") && keys.includes("magnitude_min")) {
        if (searchRadiusSchema.magnitude_max < search_params.magnitude_min){
            res.status(400).send("maximum magnitude is less than minimum magnitude");
            return false;
        }
        sql_query.push(`(magnitude BETWEEN ${search_params['magnitude_min']} AND ${search_params['magnitude_max']})`);
    }

    if (keys.includes("id")) {
        sql_query.push(`(id = ${search_params['id']})`);
    }

    if (keys.includes("country")) {
        sql_query.push(`(country = '${search_params['country']}')`);
    }

    if (keys.includes("earthquake_type")) {
        sql_query.push(`(EarthquakeType = '${search_params['earthquake_type']}')`);
    }

    if (sql_query.length == 0) {
        res.status(400).send("no search parameters");
        return false;
    }

    let query = "SELECT * FROM EarthquakeData WHERE " + sql_query.join(` ${search_params['operator']} `);

    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
            return false;
        } else {
            sql.query(query).then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).send(err);
                return false;
            })
        }
    })
})

const searchRadiusSchema = {
    latitude: ["number", true],
    longitude: ["number", true],
    radius: ["number", true]
}

router.get("/search_radius", (req, res) => {
    let search_params = req.body;

    let errors = check_body_schema(search_params, searchRadiusSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
            return false;
        } else {
            sql.query(`SELECT * FROM EarthquakeData WHERE (
                    longitude < ${search_params.longitude + search_params.radius} AND
                    longitude > ${search_params.longitude - search_params.radius} AND
                    latitude < ${search_params.latitude + search_params.radius} AND
                    latitude > ${search_params.latitude - search_params.radius}
                )`).then(sql_res => {
                let resp = [];
                for (let i in sql_res.recordset) {
                    let item = sql_res.recordset[i];
                    if (Math.pow(item.Latitude - search_params.latitude, 2) + Math.pow(item.Longitude - search_params.longitude, 2) <= Math.pow(search_params.radius, 2)) {
                        resp.push(item);
                    }
                }
                res.json(resp);
                return true;
            }).catch(err => {
                res.status(500).send(err);
                return false;
            })
        }
    })
})

const countTypeSchema = {
    start_date: ['string', true],
    end_date: ['string', true]
}
router.get("/count_type", (req, res) => {
    let search_params = req.body;

    if (!check_body_schema(search_params, countTypeSchema)) {
        res.status(400).send("Invalid request body");
        return false;
    }

    sql.connect(config, async err => {
        if (err){
            loggers.error(`Cannot connect to sql server - ${err}`)
            return false;
        } else {
            let start_date = search_params['start_date'].split("-").join("-");
            let end_date = search_params['end_date'].split("-").join("-");
            sql.query(`SELECT EarthquakeType, COUNT(id) as 'count' FROM EarthquakeData WHERE \
                    EventDate BETWEEN '${start_date}' AND '${end_date}' \
                    GROUP BY EarthquakeType`
                ).then(sql_res => {
                    res.json(sql_res.recordset);
                }).catch(err => {
                    res.status(500).send(err);
                    return false;
            })
        }
    })
})

const countWaveSchema = {
    start_date: ['string', true],
    end_date: ['string', true]
}
router.get("/count_wave", (req, res) => {
    let search_params = req.body;

    if (!check_body_schema(search_params, countWaveSchema)) {
        res.status(400).send("Invalid request body");
        return false;
    }

    sql.connect(config, async err => {
        if (err){
            loggers.error(`Cannot connect to sql server - ${err}`)
            return false;
        } else {
            let start_date = search_params['start_date'].split("-").join("-");
            let end_date = search_params['end_date'].split("-").join("-");
            sql.query(`SELECT SeismicWaveType, COUNT(id) as 'count' FROM EarthquakeData WHERE \
                    EventDate BETWEEN '${start_date}' AND '${end_date}' \
                    GROUP BY SeismicWaveType`
                ).then(sql_res => {
                    res.json(sql_res.recordset);
                }).catch(err => {
                    res.status(500).send(err);
                    return false;
            })
        }
    })
})

module.exports = router;