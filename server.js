const express = require("express");
const ruid = require("express-ruid");
const path = require("path");
const sql = require("mssql");
const dotenv = require('dotenv');
const { format, loggers, transports } = require('winston');
const { combine, timestamp, printf, colorize, align } = format;

dotenv.config();

const port = 3000;
const console_formatter = combine(
    colorize(),
    timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A',
    }),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
)

const file_formatter = combine(
    timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A',
    }),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
)

loggers.add('api_logger', {
    transports: [
        new transports.Console({format: console_formatter, level: 'debug'}),
        new transports.File({
            filename:  `logs/${new Date().toISOString().split("T")[0]}.log`,
            format: file_formatter,
            level: 'info'
        }),
        new transports.File({
            filename:  `logs/errors-${new Date().toISOString().split("T")[0]}.log`,
            format: file_formatter,
            level: 'error'
        }),
    ]
})

const logger = loggers.get("api_logger");

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
}

sql.connect(config, async err => {
    if (err){
        logger.error(`Cannot connect to sql server - ${err}`)
    }else{
        const app = express();
        app.use((_,res,next) => {
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
            res.setHeader("Access-Control-Allow-Methods", "*")
            next();
        })
        app.use(express.json()) //This parses incoming requests as JSON payloads
        app.use(ruid());

        // Log a request for all endpoints
        app.use((req, res, next) => {

            // Intercept the send function to get the request body
            const originalSend = res.send;
            let intercepted_body;
            res.send = function (body) {
                intercepted_body =  body;

                // Calling the original send function
                originalSend.call(this, intercepted_body);
            };

            // When the response has finished log the output
            res.on('finish', () => {
                if (res.statusCode == 500){
                    logger.error(`${res.statusCode} ${req.method} ${req.originalUrl} id=${req.rid} error=${intercepted_body}`);
                }else{
                    logger.info(`${res.statusCode} ${req.method} ${req.originalUrl} id=${req.rid}`);
                }
            })
            next();
            
        })

        //If there is no build in the ./frontend_build/ folder then this won't work. You can download the latest stable build from github
        app.use(express.static(path.resolve(__dirname, "./frontend_build/www"))) //This is to serve the ionic page

        app.use("/api/earthquake", earthquakeRoutes);
        app.use("/api/observatory", observatoryRoutes);
        app.use("/api/samples", samplesRoutes);
        app.use("/api/users", usersRoutes);
        app.use("/api/examples", exampleRoutes);
        app.listen(port, (err) => {
            err ? logger.error(`STARTUP startup error - ${err}`) : logger.info(`STARTUP Listening on port ${port}`)
        });
    }
})
