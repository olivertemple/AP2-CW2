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
    res.json({endpoint: "users"})
})

const searchSchema = {
    username: ["string", false],
    email: ["string", false],
    user_id: ["number", false]
}

router.get("/search", (req, res) => {
    let search_params = req.body;

    if (!check_body_schema(search_params, searchSchema)) {
        res.status(400).send("Invalid request body");
        return false;
    }

    let keys = Object.keys(search_params);
    if (keys.length == 0) {
        res.status(400).send("Missing search parameter");
        return false;
    } else if (keys.length > 1) {
        res.status(400).send("Only enter one search parameter")
        return false;
    }

    let query;
    if (keys[0] == 'id'){
        query = `SELECT * FROM users WHERE user_id = ${search_params[keys[0]]}`;
    } else {
        query = `SELECT * FROM users WHERE ${keys[0]} = '${search_params[keys[0]]}'`;
    }
    
    sql.connect(config, async err => {
        if (err) {
            console.log(err)
        } else {
            sql.query(query).then(sql_res => {
                if (sql_res.recordset.length == 0) {
                    res.status(400).send("no users found");
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
//CHANGE TO APPROPRATE PARAMETERS
const createBodySchema = {
    username: ["string", true],
    password: ['number', true],
    first_name: ["string", true],
    last_name: ['number', true],
    address: ['number', true],
    date_of_birth: ["number", true],
    user_type: ["string", true]
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
            sql.query(`INSERT INTO users VALUES (
                '${req.body.username}',
                ${req.body.password},
                '${req.body.first_name}',
                ${req.body.last_name},
                ${req.body.address},
                ${req.body.date_of_birth},
                '${req.body.user_type}'
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

module.exports = router;