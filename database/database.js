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
        // let output = await sql.query("INSERT INTO users (USERID, username, first_name, last_name, password, date_of_birth, user_type) VALUES ('3', 'olivertemple3', 'oliver3', 'temple3', 'passwordtest3', '02/08/2003', 'scientist')")
        // console.log(output)
        let res = await sql.query("SELECT * FROM users")
        console.log(res)
    }
})
