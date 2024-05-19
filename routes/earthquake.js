const express = require("express");
const { check_body_schema } = require("../utils/services");
const router = express.Router();
const sql = require("mssql");
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { update } = require("firebase/database");
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

/**
 * Handles the creation of a new earthquake record.
 *
 * @param {object} req - The request object containing the earthquake data.
 * @param {object} res - The response object to send back to the client.
 *
 * @returns {boolean} - Returns false if there is an error, true otherwise.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the observatory with the given observatory_id does not exist.
 * @throws {Error} - Throws an error if there is an error inserting the earthquake data into the EarthquakeData table.
 */

router.post("/create", (req, res) => {
    let errors = check_body_schema(req.body, createBodySchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
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
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {

            let ISO_date = new Date(req.body.datetime).toISOString();
            //console.log(ISO_date)

            let observatory_exists = await sql.query(`SELECT COUNT(*) as 'count' FROM ObservatoryData WHERE observatory_id = ${req.body.observatory_id}`)
            if (!observatory_exists.recordset[0].count){
                res.status(400).json({message: `Observatory with id ${req.body.observatory_id} does not exist`})
                return false;
            }
            let earthquake_already_exists = await sql.query(`SELECT COUNT(*) as 'count' FROM EarthquakeData WHERE longitude = ${req.body.longitude} AND latitude = ${req.body.latitude} AND event_date = '${ISO_date}'`)

            if (earthquake_already_exists.recordset[0].count) {
                res.status(400).json({message: "That earthquake is already in the database"})
                return false
            }

            sql.query(`INSERT INTO EarthquakeData VALUES (
                '${req.body.datetime}',
                ${req.body.magnitude},
                '${req.body.country}',
                ${req.body.longitude},
                ${req.body.latitude},
                ${req.body.observatory_id},
                '${req.body.earthquake_type}',
                '${req.body.seismic_wave_type}',
                ${null}
            )`).then(_ => {
                res.status(200).json({message: "Earthquake added"});

                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not add earthquake", errors: err});
                return false;
            })
        

            sql_query = `SELECT id FROM EarthquakeData WHERE event_date = '${(ISO_date)}' AND longitude=${req.body.longitude} AND latitude = ${req.body.latitude}`
            //console.log(sql_query)
            let earthq_id = await sql.query(sql_query)
            //console.log(earthq_id.recordset)

            num_id = String(earthq_id.recordset[0].id).padStart(5, '0')

            id_letter = req.body.earthquake_type[0].toUpperCase()

            name_id = "E" + id_letter + "-" + String(req.body.magnitude) + "-" + req.body.country + "-" + num_id

            update_query = `UPDATE EarthquakeData SET earthquake_name_id = '${name_id}' WHERE id = ${earthq_id.recordset[0].id}`
            
            sql.query(update_query)
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

/**
 * Handles the search functionality for earthquakes based on provided parameters.
 *
 * @param {object} req - The request object containing the search parameters.
 * @param {object} res - The response object to send back to the client.
 *
 * @returns {boolean} - Returns false if there is an error, true otherwise.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the search parameters are invalid.
 * @throws {Error} - Throws an error if there is an error executing the search query.
 */

router.post("/search", (req, res) => {
    let search_params = req.body;

    let new_body = {}
    for (let key in search_params){
        if (search_params[key] && search_params[key] != ""){
            new_body[key] = search_params[key];
        }
    }
    search_params = new_body;

    let errors = check_body_schema(search_params, searchSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    let sql_query = [];
    let keys = Object.keys(search_params);

    if (keys.includes("start_date") && keys.includes("end_date")) {
        if (new Date(search_params['start_date']) > new Date(search_params['end_date'])) {
            res.status(400).json({message: "Start date is after end date"});
            return false;
        }
    }

    if (keys.includes("start_date")){
        let start_date = search_params['start_date'];
        sql_query.push(`(event_date > '${start_date}')`);
    }

    if (keys.includes("end_date")){
        let end_date = search_params['end_date'];
        sql_query.push(`(event_date < '${end_date}')`);
    }

    if (keys.includes("magnitude_max") && keys.includes("magnitude_min")) {
        if (search_params.magnitude_max < search_params.magnitude_min){
            res.status(400).json({message: "Maximum magnitude is less than minimum magnitude"});
            return false;
        }
    }

    if (keys.includes("magnitude_max")){
        sql_query.push(`(magnitude <= ${search_params.magnitude_max})`);
    }

    if (keys.includes("magnitude_min")){
        sql_query.push(`(magnitude >= ${search_params.magnitude_min})`)
    }

    if (keys.includes("id")) {
        sql_query.push(`(id = ${search_params['id']})`);
    }

    if (keys.includes("country")) {
        sql_query.push(`(country = '${search_params['country']}')`);
    }

    if (keys.includes("earthquake_type")) {
        sql_query.push(`(earthquake_type = '${search_params['earthquake_type']}')`);
    }

    if (sql_query.length == 0) {
        res.status(400).json({message: "No search parameters"});

        return false;
    }

    let query = "SELECT * FROM EarthquakeData WHERE " + sql_query.join(` ${search_params['operator']} `);
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {
            sql.query(query).then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not complete search", errors: err});
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


/**
 * Handles the search functionality for earthquakes within a specified radius from a given latitude and longitude.
 *
 * @param {object} req - The request object containing the search parameters.
 * @param {object} res - The response object to send back to the client.
 *
 * @returns {boolean} - Returns false if there is an error, true otherwise.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the search parameters are invalid.
 * @throws {Error} - Throws an error if there is an error executing the search query.
 */

router.post("/search_radius", (req, res) => {
    let search_params = req.body;

    let errors = check_body_schema(search_params, searchRadiusSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
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
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
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
                    if (Math.pow(item.latitude - search_params.latitude, 2) + Math.pow(item.longitude - search_params.longitude, 2) <= Math.pow(search_params.radius, 2)) {
                        resp.push(item);
                    }
                }
                res.json(resp);
                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not complete search", errors: err});
                return false;
            })
        }
    })
})

const countTypeSchema = {
    start_date: ['string', false],
    end_date: ['string', false]
}

/**
 * Handles the count of earthquakes per type between given dates.
 *
 * @param {object} req - The request object containing the search parameters.
 * @param {object} res - The response object to send back to the client.
 *
 * @returns {boolean} - Returns false if there is an error, true otherwise.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the search parameters are invalid.
 * @throws {Error} - Throws an error if there is an error executing the count query.
 */

router.post("/count_type", (req, res) => {
    let search_params = req.body;

    let errors = check_body_schema(search_params, countTypeSchema);
    if (errors.length > 0 ) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    if (Object.keys(search_params).length == 0){
        res.status(400).json({message: "Invalid request body", errors: ["no search parameters supplied"]});
        return false;
    }

    if (search_params.start_date && search_params.end_date){
        if (new Date(search_params['start_date']) > new Date(search_params['end_date'])) {
            res.status(400).json({message: "Start date is after end date"});
            return false;
        }
    }
    
    let query = [];

    if (search_params.start_date){
        query.push(`(event_date > '${search_params.start_date}')`);
    }

    if (search_params.end_date){
        query.push(`(event_date < '${search_params.end_date}')`);
    }

    sql.connect(config, async err => {
        if (err){
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {
            sql.query(`SELECT earthquake_type, COUNT(id) as 'count' FROM EarthquakeData WHERE \
                ${query.length > 1 ? query.join(" AND ") : query[0]} \
                    GROUP BY earthquake_type`
                ).then(sql_res => {
                    res.json(sql_res.recordset);
                }).catch(err => {
                    res.status(500).json({message: "Could not get earthquakes", errors: err});
                    return false;
            })
        }
    })
})

const countWaveSchema = {
    start_date: ['string', false],
    end_date: ['string', false]
}


/**
 * Handles the count of seismic waves per type between given dates.
 *
 * @param {object} req - The request object containing the search parameters.
 * @param {object} res - The response object to send back to the client.
 *
 * @returns {boolean} - Returns false if there is an error, true otherwise.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the search parameters are invalid.
 * @throws {Error} - Throws an error if there is an error executing the count query.
 */

router.post("/count_wave", (req, res) => {
    let search_params = req.body;

    let errors = check_body_schema(search_params, countWaveSchema);
    if (errors.length > 0 ) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    if (Object.keys(search_params).length == 0){
        res.status(400).json({message: "Invalid request body", errors: ["no search parameters supplied"]});
        return false;
    }

    if (search_params.start_date && search_params.end_date){
        if (new Date(search_params['start_date']) > new Date(search_params['end_date'])) {
            res.status(400).json({message: "Start date is after end date"});
            return false;
        }
    }

    let query = [];

    if (search_params.start_date){
        query.push(`(event_date > '${search_params.start_date}')`);
    }

    if (search_params.end_date){
        query.push(`(event_date < '${search_params.end_date}')`);
    }

    sql.connect(config, async err => {
        if (err){
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {
            sql.query(`SELECT seismic_wave_type, COUNT(id) as 'count' FROM EarthquakeData WHERE \
                    ${query.length > 1 ? query.join(" AND ") : query[0]} \
                    GROUP BY seismic_wave_type`
                ).then(sql_res => {
                    res.json(sql_res.recordset);
                }).catch(err => {
                    res.status(500).json({message: "Could not get earthquakes", errors: err});
                    return false;
            })
        }
    })
})

/**
 * Retrieves all earthquake records from the EarthquakeData table.
 *
 * @name all_earthquakes
 * @route {GET} /all_earthquakes
 *
 * @returns {object} - An array of earthquake records.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if there is an error executing the query.
 */

router.get("/all_earthquakes", (req, res) => {
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {
            sql.query("SELECT * FROM EarthquakeData").then(sql_res => {
                res.json(sql_res.recordset);
            }).catch(err => {
                res.status(500).json({message: "Could not get earthquakes", errors: err});
            })
        }
    })
})


/**
 * Retrieves earthquake records associated with a specific observatory.
 *
 * @name observatory
 * @route {GET} /observatory
 *
 * @param {number} id - The ID of the observatory.
 *
 * @returns {object} - An array of earthquake records associated with the observatory.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the observatory ID is not provided or is not numeric.
 * @throws {Error} - Throws an error if there is an error executing the query.
 * @throws {Error} - Throws an error if no earthquakes are found associated with the observatory.
 */

router.get("/observatory", (req, res) => {
    if (!req.query.id) {
        res.status(400).json({message: "No ID sent"});
        return false;
    }

    if (!parseInt(req.query.id)){
        res.status(400).json({message: "ID was not numeric"});
        return false;
    }

    let observatory_id = req.query.id;

    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {
            try {
                let sql_res = await sql.query(`SELECT * FROM EarthquakeData WHERE observatory_id = ${observatory_id}`)

                res.json(sql_res.recordset);
            } catch (err) {
                res.status(500).json({message: "Could not get earthquakes", errors: err});
                return false;
            }
        }
    })
})

/**
 * Retrieves the count of earthquakes grouped by year from the EarthquakeData table.
 *
 * @name earthquakes_per_year
 * @route {GET} /earthquakes_per_year
 *
 * @returns {object} - An array of objects, where each object contains a year and the count of earthquakes that occurred in that year.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if there is an error executing the query.
 */

router.get("/earthquakes_per_year", (_, res) => {
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {
            sql.query("SELECT YEAR(event_date) as 'year' , COUNT(*) as 'count' FROM EarthquakeData GROUP BY YEAR(event_date);").then(sql_res => {
                let count = sql_res.recordset;

                for (let i = 0; i < count.length - 1; i++){
                    let item = count[i];
                    let next_item = count[i+1]
                    if (item.year != next_item.year - 1){
                        let diff = next_item.year - item.year;
                        for (let year = 0; year < diff - 1; year ++){
                            let new_year = item.year + year + 1;
                            count.push({year: new_year, count: 0})
                        }
                    }

                }
                count.sort((a,b) => {return a.year - b.year})

                res.status(200).json(count);

            }).catch(err => {
                res.status(500).json({message: "Could not get earthquakes", errors: err});
            })
        }
    });
})
module.exports = router;