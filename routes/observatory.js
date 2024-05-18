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


/**
 * Creates a new observatory in the ObservatoryData table.
 *
 * @name create
 * @route {POST} /create
 *
 * @param {object} req - The request object containing the observatory data.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the request body is invalid or missing required fields.
 * @throws {Error} - Throws an error if there is an error executing the query to insert the observatory data.
 */


router.post("/create", (req, res) => {
    let errors = check_body_schema(req.body, createBodySchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
    }

    if (!(req.body.latitude >= -90 && req.body.latitude <= 90)) {
        res.status(400).json({message: "invalid latitude"})
        return false
    }

    if (!(req.body.longitude >= -180 && req.body.longitude <= 180)) {
        res.status(400).json({message: "invalid longitude"})
        return false
    }

    sql.connect(config, async err => {
        if (err){
            res.status(500).json({message: "Could not connect to server", errors: err});
        }else{
            sql.query(`INSERT INTO ObservatoryData VALUES (
                '${req.body.name}',
                '${req.body.country}',
                ${req.body.latitude},
                ${req.body.longitude},
                '${req.body.date_established}'
            )`).then(_ => {
                res.status(200).json({message: "Observatory added"});
            }).catch(err => {
                res.status(500).json({message: "COuld not create observatory", errors: err});
            })
        }
    })
})


/**
 * Retrieves the earthquake with the largest magnitude from a specific observatory.
 *
 * @name largest_magnitude
 * @route {GET} /largest_magnitude
 *
 * @param {object} req - The request object containing the observatory ID as a query parameter.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the observatory ID is not provided in the request query parameters.
 * @throws {Error} - Throws an error if there is an error executing the query to retrieve the earthquake data.
 */

router.get("/largest_magnitude", (req, res) => {
    if (!req.query.id){
        res.status(400).json({message: "No ID sent"});
        return false;
    }
    let observatory_id = req.query.id;
    sql.connect(config, async err => {
        if (err){
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        }else{
            sql.query(`SELECT * from EarthquakeData e WHERE e.magnitude =  COALESCE((SELECT MAX(magnitude) FROM EarthquakeData WHERE observatory_id = ${observatory_id}), 0) `).then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not get earthquake", errors: err});
                return false;
            })
        }
    })
})

/**
 * Retrieves the average magnitude of earthquakes from a specific observatory.
 *
 * @name average_magnitude
 * @route {GET} /average_magnitude
 *
 * @param {object} req - The request object containing the observatory ID as a query parameter.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the observatory ID is not provided in the request query parameters.
 * @throws {Error} - Throws an error if there is an error executing the query to retrieve the earthquake data.
 */
router.get("/average_magnitude", (req, res) => {
    if (!req.query.id) {
        res.status(400).json({message: "No ID sent"});
        return false;
    }

    let observatory_id = req.query.id;
    sql.connect(config, async err => {
        if (err){
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        }else{
            sql.query(`SELECT COALESCE(AVG(magnitude), 0) FROM EarthquakeData WHERE observatory_id = ${observatory_id}`).then(sql_res => {
                res.json({"average_magnitude": sql_res.recordset[0]['']});
                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not get earthquakes", errors: err});
                return false;
            })
        }
    })
})

/**
 * Retrieves the average number of earthquakes per year from a specific observatory.
 *
 * @name average_number
 * @route {GET} /average_number
 *
 * @param {object} req - The request object containing the observatory ID as a query parameter.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the observatory ID is not provided in the request query parameters.
 * @throws {Error} - Throws an error if there is an error executing the query to retrieve the earthquake data.
 */

router.get("/average_number", (req, res) => {
    if (!req.query.id) {
        res.status(400).json({message: "No ID sent"});
        return false;
    }
    let observatory_id = req.query.id;

    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {
            try {
                let sql_res_count = await sql.query(`SELECT COUNT(id) FROM EarthquakeData WHERE observatory_id = ${observatory_id} GROUP BY YEAR(event_date)`)

                let total = 0;
                for (let i in sql_res_count.recordset) {
                    total += sql_res_count.recordset[i]['']
                }

                let sql_res_date = await sql.query(`SELECT established_date FROM ObservatoryData WHERE observatory_id = ${observatory_id}`)
                if (sql_res_date.recordset.length == 0) {
                    err_msg = `observatory with id of ${observatory_id} not found`
                    res.status(400).json({message: err_msg});
                    return false;
                }
                let num_years = new Date().getFullYear() - new Date(sql_res_date.recordset[0].established_date).getFullYear();
                let average = total / num_years;
                console.log(average)

                res.json({"average_number": average});
            } catch (err) {
                res.status(500).json({message: "Could not complete request", errors: err});
                return false;
            }
        }
    })
})

/**
 * Retrieves all observatories from the ObservatoryData table.
 *
 * @name all_observatories
 * @route {GET} /all_observatories
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if there is an error executing the query to retrieve the observatory data.
 */

router.get("/all_observatories", (req, res) => {
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {
            sql.query("SELECT * FROM ObservatoryData").then(sql_res => {
                res.json(sql_res.recordset);
            }).catch(err => {
                res.status(500).json({message: "Could not get observatories", errors: err});
            })
        }
    })
})

module.exports = router;
