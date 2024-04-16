const express = require("express");
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
    res.json({endpoint: "example endpoint"})
})

router.get("/get_by_id", (req, res) => {
    console.log(req.query);

    if (req.query.id) {
        let id = req.query.id;
        sql.connect(config, async err => {
            if (err){
                console.log(err)
            }else{
                console.log("connection successful")
                let sql_res = await sql.query(`SELECT * FROM examples WHERE Earthquake_id = ${id}`);
                console.log(sql_res);
                res.json(sql_res.recordset)
            }
        })
    }else{
        res.status(404)
    }

})

module.exports = router;