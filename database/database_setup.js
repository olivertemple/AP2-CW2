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
    id INT IDENTITY PRIMARY KEY NOT NULL, \
    event_date DATETIME NOT NULL, \
    magnitude FLOAT NOT NULL, \
    country VARCHAR(100) NOT NULL, \
    longitude FLOAT NOT NULL, \
    latitude FLOAT NOT NULL, \
    observatory_id INT FOREIGN KEY REFERENCES ObservatoryData(observatory_id) NOT NULL, \
    earthquake_type VARCHAR(50) CHECK (earthquake_type IN ('tectonic', 'collapse', 'explosion', 'volcanic')) NOT NULL, \
    seismic_wave_type VARCHAR(50) CHECK (seismic_wave_type IN ('p', 's', 'love', 'rayleigh')) NOT NULL, \
    earthquake_name_id VARCHAR(MAX) \
);"

let usersTable = "CREATE TABLE users ( \
    user_id INT IDENTITY PRIMARY KEY NOT NULL, \
    username VARCHAR(25) NOT NULL, \
    password VARCHAR(100) NOT NULL, \
    first_name VARCHAR(50) NOT NULL, \
    last_name VARCHAR(50) NOT NULL, \
    address VARCHAR(100) NOT NULL, \
    date_of_birth DATE NOT NULL, \
    user_type VARCHAR(20) CHECK (user_type IN ('general', 'junior scientist', 'senior scientist', 'admin')) NOT NULL, \
    email VARCHAR(50) NOT NULL, \
    access_token VARCHAR(50) NOT NULL,\
    observatory_id INT FOREIGN KEY REFERENCES ObservatoryData(observatory_id) \
);"

let observatoryTable = "CREATE TABLE ObservatoryData ( \
    observatory_id INT IDENTITY PRIMARY KEY NOT NULL, \
    observatory_name VARCHAR(100) NOT NULL, \
    country VARCHAR(100) NOT NULL, \
    latitude FLOAT NOT NULL, \
    longitude FLOAT NOT NULL, \
    established_date DATE NOT NULL \
);"

let sampleTable = "CREATE TABLE SampleData ( \
    sample_id INT IDENTITY PRIMARY KEY NOT NULL, \
    earthquake_id INT FOREIGN KEY REFERENCES EarthquakeData(id) NOT NULL, \
    collection_date DATE NOT NULL, \
    sample_type VARCHAR(50) NOT NULL, \
    longitude FLOAT NOT NULL, \
    latitude FLOAT NOT NULL, \
    country VARCHAR(100) NOT NULL, \
    current_location VARCHAR(100) NOT NULL, \
    is_sample_required BIT NOT NULL, \
    item_value float NOT NULL, \
    is_sold BIT NOT NULL, \
    observations TEXT NOT NULL, \
    shop_description TEXT, \
    image_url TEXT, \
    item_name TEXT, \
    earthq_name_id TEXT \
);"

let transactionTable = "CREATE TABLE Transactions ( \
    transaction_id INT IDENTITY PRIMARY KEY NOT NULL, \
    buyer_id INT FOREIGN KEY REFERENCES users(user_id), \
    value FLOAT NOT NULL, \
    date_of_purchase DATETIME NOT NULL, \
    collection_status VARCHAR(100) NOT NULL, \
    sample_id INT FOREIGN KEY REFERENCES sampleData(sample_id) NOT NULL, \
    order_number VARCHAR(100) NOT NULL\
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

        await sql.query(transactionTable).catch(err => {
            if (err.originalError.info.number = 2714) {
                console.error("Transaction table already exists");
            }else{
                console.error(err);
            }
        })
    }
})