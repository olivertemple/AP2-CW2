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
        await sql.query("DROP TABLE Transactions")
        await sql.query("DROP TABLE SampleData")
        await sql.query("DROP TABLE EarthquakeData")
        await sql.query("DROP TABLE users")
        await sql.query("DROP TABLE ObservatoryData")
    }
})