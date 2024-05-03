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

router.post("/search", (req, res) => {
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
    user_type: ["string", true],
    email: ["string", true]
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
            // do if username doenst already exists do this, otherwise error message.
            // to check username do SQL query SELECT * FROM users WHERE username = req.body.username and do count
            try{
                var username_check = await sql.query(`SELECT COUNT(username) FROM users WHERE username ='${req.body.username}'`)
                const username_recordset = username_check.recordset;
                const username_instances = username_recordset[0]['']

                var email_check = await sql.query(`SELECT COUNT(username) FROM users WHERE email ='${req.body.email}'`)
                const email_recordset = email_check.recordset;
                const email_instances = email_recordset[0]['']

                if (username_instances > 0){
                    res.status(400).send("Username already exists");
                    return false;
                }

                if (email_instances > 0) {
                    res.status(400).send("This email is already being used for another account");
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
                    '${req.body.email}',
                    '${access_token}'
                )`).then(_ => {
                    res.status(200).json({
                        username: req.body.username,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        user_type: req.body.user_type,
                        access_token: access_token});
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

router.get("/delete", (req, res) => {
    if (!req.query.id) {
        res.status(400).send("no id sent");
        return false;
    }

    if (!parseInt(req.query.id, 10)) {
        res.status(400).send("invalid id");
        return false;
    }

    let user_id = req.query.id;
    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
            return false;
        }

        try {
            let sql_res = await sql.query(`SELECT * FROM users WHERE user_id = ${user_id}`);
            if (!sql_res.recordset.length) {
                res.status(400).send(`user with id ${user_id} does not exist`)
                return false
            }
            sql.query(`DELETE FROM users WHERE user_id = ${user_id}`)
            res.status(200).send(`user ${user_id} deleted`)

        } catch (err) {
            res.status(500).send(err);
            return false;
        }
    })
})

const loginBodySchema = {
    username: ['string', true],
    password: ['string', true]
}

router.post("/login", (req, res) => {
    let errors = check_body_schema(req.body, loginBodySchema);
    if (errors.length > 0){
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    sql.connect(config, async err => {
        if (err) {
            res.status(500).send(err);
            return false;
        }

        sql.query(`SELECT * FROM users WHERE username='${req.body.username}' AND password='${req.body.password}'`).then(sql_res => {
            if (sql_res.recordset.length > 0){
                res.status(200).json({
                    username: sql_res.recordset[0].username,
                    first_name: sql_res.recordset[0].first_name,
                    last_name: sql_res.recordset[0].last_name,
                    user_type: sql_res.recordset[0].user_type,
                    access_token: sql_res.recordset[0].access_token
                });
                return true;
            }

            res.status(401).send("invalid credentials")
            return false;
        }).catch(err => {
            res.status(500).send(err);
            return false;
        })
        
    })
})


module.exports = router;