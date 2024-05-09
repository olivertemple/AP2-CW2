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
const shop_description = ''

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
                    '${req.body.Observations}',
                    '${shop_description}'
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


router.get("/get_all_specimens", (req, res) => {

    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
        } else {
            sql.query("SELECT * FROM SampleData").then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).send(err);
                return false;
            })
        }
    })
})


const searchSchema = {
    SampleId: ["number", false],
    EarthquakeId: ["number", false],
    CollectionDate: ['string', false],
    SampleType: ["string", false],
    Longitude: ['number', false],
    Latitude: ['number', false],
    Country: ["string", false],
    CurrentLocation: ["string", false],
    IsSampleRequired: ["boolean", false],
    ItemValue: ["number", false],
    IsSold: ["boolean", false]
}

router.get("/search", (req, res) => {
    let search_params = req.body;

    let errors = check_body_schema(search_params, searchSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    let keys = Object.keys(search_params);
    if (keys.length == 0) {
        res.status(400).send("Missing search parameters");
        return false;
    }


    let query;
    query = `SELECT * FROM SampleData WHERE `;

    let conditions
    conditions = [];
    
    for (let key in search_params){
        conditions.push(`${key} = '${search_params[key]}'`)
    }

    conditions = conditions.join(" AND ")

    query = query + conditions
    
    console.log(query)
    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
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



deleteSchema = {
    SampleId: ["number", true]
}

router.post("/delete", (req, res) => {
    let delete_params = req.body;

    let errors = check_body_schema(delete_params, deleteSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    let keys = Object.keys(delete_params);
    if (keys.length == 0) {
        res.status(400).send("Missing search parameters");
        return false;
    }

    let query;
    query = `DELETE FROM SampleData WHERE SampleId = '${delete_params[keys[0]]}'`

    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
        } else {
            try{

                sql.query(query
                ).then(_ => {
                    res.status(200).send("Specimen deleted");
                    return true;
                }).catch(err => {
                    res.status(500).send(`could not delete specimen, ${err}`);
                    return false;
                })
            } catch (err) {
                res.status(500).send(err);
            }
            
        }
    })

})

router.get("/to_sell", (req, res) => {
    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
        } else {
            sql.query("SELECT * FROM SampleData WHERE IsSampleRequired = 0").then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).send(err);
                return false;
            })
        }
    })
})


priceSchema = {
    ItemValue: ["number", true],
    SampleId: ["number", true],
    shop_description: ["string", true]
}

router.post("/add_to_shop", (req, res) =>{
    let price_params = req.body;

    let errors = check_body_schema(price_params, priceSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    let keys = Object.keys(price_params);
    if (keys.length == 0) {
        res.status(400).send("Missing search parameters");
        return false;
    }

    let query;
    query = `UPDATE SampleData SET IsSampleRequired = 0, ItemValue = '${req.body.ItemValue}', shop_description = '${req.body.shop_description}' WHERE SampleId = '${req.body.SampleId}'`

    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
        } else {
            try{

                sql.query(query
                ).then(_ => {
                    res.status(200).send("Item can be sold");
                    return true;
                }).catch(err => {
                    res.status(500).send(`could not alter item status, ${err}`);
                    return false;
                })
            } catch (err) {
                res.status(500).send(err);
            }
            
        }
    })

})


module.exports = router;