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

let earthquakeTable = "CREATE TABLE EarthquakeData ( \
    Id INT IDENTITY PRIMARY KEY NOT NULL, \
    EventDate DATETIME NOT NULL, \
    Magnitude FLOAT NOT NULL, \
    Country VARCHAR(100) NOT NULL, \
    Long VARCHAR(100) NOT NULL, \
    Lat VARCHAR(100) NOT NULL, \
    ObservatoryId INT FOREIGN KEY REFERENCES ObservatoryData(ObservatoryId) NOT NULL, \
    EarthquakeType VARCHAR(50) NOT NULL, \
    SeismicWaveType VARCHAR(50) NOT NULL \
);"

let usersTable = "CREATE TABLE users ( \
    user_id INT NOT NULL, \
    username VARCHAR(25) NOT NULL, \
    password VARCHAR(30) NOT NULL, \
    first_name VARCHAR(50) NOT NULL, \
    last_name VARCHAR(50) NOT NULL, \
    address VARCHAR(100) NOT NULL, \
    date_of_birth DATE NOT NULL, \
    user_type VARCHAR(20) CHECK (user_type IN ('general', 'junior scientist', 'senior scientist', 'admin')) NOT NULL, \
    PRIMARY KEY(user_id) \
);"

let observatoryTable = "CREATE TABLE ObservatoryData ( \
    ObservatoryId INT IDENTITY PRIMARY KEY NOT NULL, \
    ObservatoryName VARCHAR(100) NOT NULL, \
    Country VARCHAR(100) NOT NULL, \
    Latitude FLOAT NOT NULL, \
    Longitude FLOAT NOT NULL, \
    EstablishedDate DATE NOT NULL \
);"

let sampleTable = "CREATE TABLE SampleData ( \
    SampleId INT IDENTITY PRIMARY KEY NOT NULL, \
    EarthquakeId INT FOREIGN KEY REFERENCES EarthquakeData(Id) NOT NULL, \
    CollectionDate DATE NOT NULL, \
    SampleType VARCHAR(50) NOT NULL, \
    Longitude FLOAT NOT NULL, \
    Latitude FLOAT NOT NULL, \
    Country VARCHAR(100) NOT NULL, \
    CurrentLocation VARCHAR(100) NOT NULL, \
    IsSampleRequired BIT NOT NULL, \
    ItemValue NUMERIC(10, 2) NOT NULL, \
    IsSold BIT NOT NULL, \
    BuyerId INT FOREIGN KEY REFERENCES users(user_id) NOT NULL, \
    Observations TEXT NOT NULL \
);"



sql.connect(config, async err => {
    if (err){
        console.log(err)
    }else{
        console.log("connection successful")
        await sql.query(usersTable).catch(err => {
            if (err.originalError.info.number == 2714){
                console.error("Table users already exists");
            }else{
                console.error(err);
            }
        });

        await sql.query(observatoryTable).catch(err => {
            if (err.originalError.info.number = 2714) {
                console.error("Observatory table already exists");
            }else{
                console.error(err);
            }
        });

        await sql.query(earthquakeTable).catch(err => {
            if (err.originalError.info.number = 2714) {
                console.error("Earthquake table already exists");
            }else{
                console.error(err);
            }
        });

        await sql.query(sampleTable).catch(err => {
            if (err.originalError.info.number = 2714) {
                console.error("Sample table already exists");
            }else{
                console.error(err);
            }
        });
    }
})