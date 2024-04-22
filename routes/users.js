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

    let keys = Object.keys(search_params);
    if (keys.length == 0) {
        res.status(400).send("Missing search parameter");
        return false;
    }
    else if (keys.length =! 1) {
        res.status(400).send("Only enter one search parameter")
    }

    let sql_query = "";
    
    for (let key in keys) {
        sql_query = `${key}='${search_params[key]}'`;
        break;
    }
    let query = `SELECT * FROM users WHERE ${sql_query}`;

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

module.exports = router;