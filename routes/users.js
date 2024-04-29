const express = require("express");
const { check_body_schema } = require("../utils/services");
const router = express.Router();
const sql = require("mssql");
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

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

    let errors = check_body_schema(search_params, searchSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
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
const createBodySchema = {
    username: ["string", true],
    password: ['string', true],
    first_name: ["string", true],
    last_name: ['string', true],
    address: ['string', true],
    date_of_birth: ["string", true],
    user_type: ["string", true]
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
        } else {
            // do if username doenst already exists do this, otherwise error message.
            // to check username do SQL query SELECT * FROM users WHERE username = req.body.username and do count
            try{
                var sql_check = await sql.query(`SELECT COUNT(username) FROM users WHERE username ='${req.body.username}'`)
                const recordset = sql_check.recordset;
                const username_instances = recordset[0]['']
                if (username_instances > 0){
                    res.status(400).send("Username already exists");
                    return false;
                }
                
                let salt = bcrypt.genSaltSync(10);
                let access_token = bcrypt.hashSync(req.body.username, salt).substring(0, 30);
                sql.query(`INSERT INTO users VALUES (
                    '${req.body.username}',
                    '${req.body.password}',
                    '${req.body.first_name}',
                    '${req.body.last_name}',
                    '${req.body.address}',
                    '${req.body.date_of_birth}',
                    '${req.body.user_type}',
                    'email@domain.com',
                    '${access_token}'
                )`).then(_ => {
                    res.status(200).send("success");
                    return true;
                }).catch(err => {
                    res.status(500).send(`could not add user, ${err}`);
                    return false;
                })
            } catch (err) {
                res.status(500).send(err);
            }
            
        }
    })
})

module.exports = router;