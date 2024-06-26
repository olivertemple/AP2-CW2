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
    user_id: ["number", false],
    observatory_id: ["number", false]
}

/**
 * Searches for users based on the provided search parameters.
 *
 * @name search
 * @route {POST} /search
 *
 * @param {object} req - The request object containing the search parameters.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the request body is invalid.
 * @throws {Error} - Throws an error if there is an error executing the query to retrieve the user data.
 */

router.post("/search", (req, res) => {
    let search_params = req.body;

    let errors = check_body_schema(search_params, searchSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    let keys = Object.keys(search_params);
    if (keys.length == 0) {
        res.status(400).json({message: "Missing search parameter"});
        return false;
    } else if (keys.length > 1) {
        res.status(400).json({message: "Only enter one search parameter"})
        return false;
    }

    
    let query = `SELECT * FROM users WHERE ${keys[0]} = '${search_params[keys[0]]}'`;
    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({errors: err});
            return false;
        } else {
            sql.query(query).then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).json({errors: err});
                return false;
            })
        }
    })
})

/**
 * Returns all users in the database.
 *
 * @name search
 * @route {POST} /search
 *
 * @param {object} req - The request object containing the search parameters.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if there is an error executing the query to retrieve the user data.
 */


router.get("/get_all_users", (req, res) => {

    let query = `SELECT * FROM users`;
    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({errors: err});
            return false;
        } else {
            sql.query(query).then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).json({errors: err});
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
    email: ["string", true],
    observatory_id: ["number", false]
}

/**
 * Creates a new user based on the provided information.
 *
 * @name create
 * @route {POST} /create
 *
 * @param {object} req - The request object containing the user information.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the request body is invalid.
 * @throws {Error} - Throws an error if there is an error executing the query to add the user data.
 *
 */

router.post("/create", (req, res) => {
    let errors = check_body_schema(req.body, createBodySchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    if (req.body.date_of_birth == "") {
        res.status(400).json({message: "Date of birth not entered"})
        return false
    }

    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({errors: err});
            return false;
        } else {
            try{
                var username_check = await sql.query(`SELECT COUNT(username) FROM users WHERE username ='${req.body.username}'`)
                const username_recordset = username_check.recordset;
                const username_instances = username_recordset[0]['']

                var email_check = await sql.query(`SELECT COUNT(username) FROM users WHERE email ='${req.body.email}'`)
                const email_recordset = email_check.recordset;
                const email_instances = email_recordset[0]['']

                if (!(req.body.user_type == "senior scientist" || req.body.user_type == "junior scientist" || req.body.user_type == "general" || req.body.user_type == "admin")) {
                    res.status(403).json({message: "Invalid user type"});
                    return false;
                }

                if (username_instances > 0){
                    res.status(400).json({message: "Username already exists"});
                    return false;
                }

                if (email_instances > 0) {
                    res.status(400).json({message: "This email is already being used for another account"});
                    return false;
                }

                if (req.body.observatory_id) {
                    let observatory_check = await sql.query(`SELECT COUNT(observatory_id) from ObservatoryData WHERE observatory_id = ${req.body.observatory_id}`);
                    if (observatory_check.recordset[0][''] == 0){
                        res.status(400).json({message: `Observatory with id ${req.body.observatory_id} does not exist`})
                        return false;
                    }
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
                    '${access_token}',
                    ${req.body.observatory_id || null}
                )`).then(async () => {
                    let max_id_sql = await sql.query("SELECT MAX(user_id) as 'max' from users");
                    let max_id = max_id_sql.recordset[0].max;
                    res.status(200).json({
                        username: req.body.username,
                        first_name: req.body.first_name,
                        user_id: max_id,
                        last_name: req.body.last_name,
                        user_type: req.body.user_type,
                        access_token: access_token,
                        observatory_id: req.body.observatory_id || null});
                    return true;
                }).catch(err => {
                    res.status(500).json({message: `could not add user, ${err}`});
                    return false;
                })
            } catch (err) {
                res.status(500).json({errors: err});
            }
            
        }
    })
})

/**
 * Deletes a user based on the provided user ID.
 *
 * @name delete
 * @route {GET} /delete
 *
 * @param {object} req - The request object containing the user ID.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the user ID is not provided or is invalid.
 * @throws {Error} - Throws an error if there is an error executing the query to delete the user data.
 */

router.get("/delete", (req, res) => {
    if (!req.query.id) {
        res.status(400).json({message: "no id sent"});
        return false;
    }

    if (!parseInt(req.query.id, 10)) {
        res.status(400).json({message: "invalid id"});
        return false;
    }

    let user_id = req.query.id;
    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({errors: err});
            return false;
        }

        try {
            await sql.query(`UPDATE Transactions SET buyer_id = ${null} FROM Transactions WHERE buyer_id = ${user_id}`);
            let sql_res = await sql.query(`SELECT * FROM users WHERE user_id = ${user_id}`);
            if (!sql_res.recordset.length) {
                res.status(400).json({message: `user with id ${user_id} does not exist`})
                return false
            }
            sql.query(`DELETE FROM users WHERE user_id = ${user_id}`)
            res.status(200).json({message: `user ${user_id} deleted`})

        } catch (err) {
            res.status(500).json({errors: err});
            return false;
        }
    })
})

const loginBodySchema = {
    username: ['string', true],
    password: ['string', true]
}

/**
 * Authenticates a user based on the provided username and password.
 *
 * @name login
 * @route {POST} /login
 *
 * @param {object} req - The request object containing the username and password.
 * @param {object} res - The response object to send back to the client.
 *
 * @throws {Error} - Throws an error if there is a database connection error.
 * @throws {Error} - Throws an error if the request body is invalid.
 * @throws {Error} - Throws an error if the provided credentials are invalid.
 */

router.post("/login", (req, res) => {
    let errors = check_body_schema(req.body, loginBodySchema);
    if (errors.length > 0){
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({errors: err});
            return false;
        }

        sql.query(`SELECT * FROM users WHERE username='${req.body.username}' AND password='${req.body.password}'`).then(async sql_res => {
            if (sql_res.recordset.length > 0){
                
                res.status(200).json({
                    username: sql_res.recordset[0].username,
                    first_name: sql_res.recordset[0].first_name,
                    last_name: sql_res.recordset[0].last_name,
                    user_type: sql_res.recordset[0].user_type,
                    access_token: sql_res.recordset[0].access_token,
                    observatory_id: sql_res.recordset[0].observatory_id,
                    user_id: sql_res.recordset[0].user_id
                });
                return true;
            }

            res.status(401).json({message: "Invalid credentials"})
            return false;
        }).catch(err => {
            res.status(500).json({errors: err});
            return false;
        })
        
    })
})


module.exports = router;