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
    let errors = check_body_schema(req.body, createBodySchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
    }

    sql.connect(config, async err => {
        if (err){
            res.status(500).send(err);
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
                res.status(500).send(err);
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
            res.status(500).send(err);
            return false;
        }else{
            sql.query(`SELECT * from EarthquakeData e WHERE e.magnitude = (SELECT MAX(magnitude) FROM EarthquakeData WHERE ObservatoryId = ${observatory_id}) `).then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).send(err);
                return false;
            })
        }
    })
})

router.get("/average_magnitude", (req, res) => {
    if (!req.query.id) {
        res.status(400).send("no id sent");
        return false;
    }

    let observatory_id = req.query.id;
    sql.connect(config, async err => {
        if (err){
            res.status(500).send(err);
            return false;
        }else{
            sql.query(`SELECT AVG(magnitude) FROM EarthquakeData WHERE ObservatoryId = ${observatory_id}`).then(sql_res => {
                res.json({"average_magnitude": sql_res.recordset[0]['']});
                return true;
            }).catch(err => {
                res.status(500).send(err);
                return false;
            })
        }
    })
})

router.get("/average_number", (req, res) => {
    if (!req.query.id) {
        res.status(400).send("no id sent");
        return false;
    }
    let observatory_id = req.query.id;

    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
            return false;
        } else {
            try {
                let sql_res_count = await sql.query(`SELECT COUNT(id) FROM EarthquakeData WHERE ObservatoryId = ${observatory_id} GROUP BY YEAR(EventDate)`)

                let total = 0;
                for (let i in sql_res_count.recordset) {
                    total += sql_res_count.recordset[i]['']
                }

                let sql_res_date = await sql.query(`SELECT EstablishedDate FROM ObservatoryData WHERE ObservatoryId = ${observatory_id}`)
                if (sql_res_date.recordset.length == 0) {
                    res.status(400).send(`observatory with id of ${observatory_id} not found`);
                    return false;
                }
                let num_years = new Date().getFullYear() - new Date(sql_res_date.recordset[0].EstablishedDate).getFullYear();
                let average = total / num_years;

                res.json({"average_number": average});
            } catch (err) {
                res.status(500).send(err);
                return false;
            }
        }
    })
})

module.exports = router;
