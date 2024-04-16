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

sql.connect(config, async err => {
    if (err){
        console.log(err)
    }else{
        console.log("connection successful")
        let res = await sql.query("SELECT * FROM examples WHERE Earthquake_id = '1'")
        console.log(res)
    }
})
