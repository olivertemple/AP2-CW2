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
    earthquake_id: ["number", true],
    collection_date: ['string', true],
    sample_type: ["string", true],
    longitude: ['number', true],
    latitude: ['number', true],
    country: ["string", true],
    current_location: ["string", true],
    observations: ["string", true]
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
            res.status(500).json({message: "Could not connect to server", errors: err});

        } else {
            try{

                sql.query(`INSERT INTO SampleData VALUES (
                    '${req.body.earthquake_id}',
                    '${req.body.collection_date}',
                    '${req.body.sample_type}',
                    '${req.body.longitude}',
                    '${req.body.latitude}',
                    '${req.body.country}',
                    '${req.body.current_location}',
                    '${IsSampleRequired}',
                    '${ItemValue}',
                    '${IsSold}',
                    '${req.body.observations}',
                    '${shop_description}'
                )`).then(_ => {
                    res.status(200).json({message: "Specimen added"});
                    return true;
                }).catch(err => {
                    res.status(500).json({message: "Could not add specimen", errors: err});

                    return false;
                })
            } catch (err) {
                res.status(500).json({message: "Server error", errors: err});

            }
            
        }
    })

})


router.get("/get_all_specimens", (req, res) => {

    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});

        } else {
            sql.query("SELECT * FROM SampleData").then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not retrieve specimens", errors: err});

                return false;
            })
        }
    })
})


const searchSchema = {
    sample_id: ["number", false],
    earthquake_id: ["number", false],
    collection_date: ['string', false],
    sample_type: ["string", false],
    longitude: ['number', false],
    latitude: ['number', false],
    country: ["string", false],
    current_location: ["string", false],
    is_sample_required: ["boolean", false],
    item_value: ["number", false],
    is_sold: ["boolean", false]
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
        res.status(400).json({message: "Missing search parameters", errors: err});

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
            res.status(500).json({message: "Could not connect to server", errors: err});

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



deleteSchema = {
    sample_id: ["number", true]
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
        res.status(400).json({message: "missing sample ID"});

        return false;
    }

    let query;
    query = `DELETE FROM SampleData WHERE sample_id = '${delete_params[keys[0]]}'`

    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});

        } else {
            try{

                sql.query(query
                ).then(_ => {
                    res.status(200).json({message: "Specimen deleted"});
                    return true;
                }).catch(err => {
                    res.status(500).json({message: "Could not delete specimen", errors: err});
                    return false;
                })
            } catch (err) {
                res.status(500).json({message: "Server error", errors: err});

            }
            
        }
    })

})

router.get("/to_sell", (req, res) => {
    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
        } else {
            sql.query("SELECT * FROM SampleData WHERE is_sample_required = 0").then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not retrieve specimens", errors: err});

                return false;
            })
        }
    })
})


priceSchema = {
    item_value: ["number", true],
    sample_id: ["number", true],
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
        res.status(400).json({message: "Missing search parameters"});
        return false;
    }

    let query;
    query = `UPDATE SampleData SET is_sample_required = 0, item_value = '${req.body.item_value}', shop_description = '${req.body.shop_description}' WHERE sample_id = '${req.body.sample_id}'`

    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Couldn't connect to server", errors: err});
        } else {
            try{

                sql.query(query
                ).then(_ => {
                    res.status(200).json({message: "Item can be sold"});
                    return true;
                }).catch(err => {
                    res.status(500).json({message: "Could not alter item status", errors: err});

                    return false;
                })
            } catch (err) {
                res.status(500).json({message: "SQL error", errors: err});

            }
            
        }
    })

})


module.exports = router;