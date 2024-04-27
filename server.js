const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require('dotenv');
dotenv.config();


const port = 3000;

const earthquakeRoutes = require("./routes/earthquake");
const observatoryRoutes = require("./routes/observatory");
const samplesRoutes = require("./routes/samples");
const usersRoutes = require("./routes/users");
const exampleRoutes = require("./routes/example_endpoints");

var config = {
    "user": process.env.USER, // Database username
    "password": process.env.PASSWORD, // Database password
    "server": process.env.SERVER, // Server IP address
    "database": process.env.DATABASE, // Database name
    "options": {
        "encrypt": false, // Disable encryption
        "trustServerCertificate": false
    },
    "connectionTimeout": 200
}

sql.connect(config, async err => {
    if (err){
        console.log("Cannot connect to sql server")
    }else{
        const app = express();
        app.use((req,res,next) => {
            res.setHeader("Access-Control-Allow-Origin", "*")
            next();
        })
        app.use(express.json()) //This parses incoming requests as JSON payloads

        //If there is no build in the ./frontend_build/ folder then this won't work. You can download the latest stable build from github
        app.use(express.static(path.resolve(__dirname, "./frontend_build/www"))) //This is to serve the ionic page

        app.use("/api/earthquake", earthquakeRoutes);
        app.use("/api/observatory", observatoryRoutes);
        app.use("/api/samples", samplesRoutes);
        app.use("/api/users", usersRoutes);
        app.use("/api/examples", exampleRoutes);
        app.listen(port, (err) => {
            err ? console.log(err) : console.log(`Listening on port ${port}`)
        });
    }
})
