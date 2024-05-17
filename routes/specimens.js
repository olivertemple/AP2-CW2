const express = require("express");
const { check_body_schema } = require("../utils/services");
const router = express.Router();
const sql = require("mssql");
const dotenv = require('dotenv');
var firebase = require("firebase/app");
var storage = require("firebase/storage");
var database = require("firebase/database")

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

const firebaseConfig = {
    apiKey: "AIzaSyCUZzDn59QybFV3iduWhriy6ziqFuuTrWA",
    authDomain: "seiswatch-b4c2f.firebaseapp.com",
    databaseURL:
        "https://seiswatch-b4c2f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "seiswatch-b4c2f",
    storageBucket: "seiswatch-b4c2f.appspot.com",
    messagingSenderId: "998371569633",
    appId: "1:998371569633:web:00b1450e94a20dc8f72ca0",
};
const app = firebase.initializeApp(firebaseConfig);

const bucket = storage.getStorage();
const imageRef = storage.ref(bucket, 'images');

const db = database.getDatabase(app);

router.get("/", (req, res) => {
    res.json({endpoint: "specimens"})
})

const createBodySchema = {
    earthquake_id: ["number", true],
    collection_date: ['string', true],
    sample_type: ["string", true],
    longitude: ['number', true],
    latitude: ['number', true],
    country: ["string", true],
    current_location: ["string", true],
    observations: ["string", true],
    image: ["string", true] //base64 encoded image please
}

const IsSampleRequired = true
const ItemValue = 0
const IsSold = false
const shop_description = ''
const empty_item_name = ''

/**
 * This function handles the POST request to the "/create" endpoint.
 * It adds a new specimen to the database by validating the request body,
 * uploading the image to Firebase Storage, and inserting the data into the SQL Server database.
 *
 * @param {Request} req - The request object representing the HTTP request.
 * @param {Response} res - The response object representing the HTTP response.
 *
 * @returns {void} This function does not return any value.
 *
 * @throws {HTTPError} If the request body is invalid or if there is an error connecting to the database or Firebase Storage.
 */

router.post("/create", async (req, res) => {
    

    let errors = check_body_schema(req.body, createBodySchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    if (!(req.body.current_location == "")){
        var location = req.body.current_location;
        const location_format = /^[A-Z]{1}[0-9]{1}$/;
        //|collected|awaiting collection
        let test_var = location_format.test(location)
        if (!test_var) {
            res.status(400).json({message: "Invalid location format", errors: location});
            return false;
        }
    } else{
        loopchar:
            for (i = 65; i <= 90; i++) {
                letter = String.fromCharCode(i);
                for (num = 0; num <= 9; num++) {
                    shelf = letter + String(num)
                    sql_query = `SELECT COUNT(*) FROM SampleData WHERE current_location = '${shelf}'`
                    var storage_check = await sql.query(sql_query)
                    const storage_recordset = storage_check.recordset;
                    const storage_instances = storage_recordset[0]['']
                    if (storage_instances >= 10) {
                        continue
                    }
                    else {
                        location = shelf
                        break loopchar
                    }
                }
            }
    }


    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
        } else {
            try{
                let max_id_sql = await sql.query("SELECT MAX(sample_id) as 'max' from SampleData");

                let max_id = max_id_sql.recordset[0].max + 1;

                let image_ref = storage.ref(imageRef, `${max_id}-${req.body.collection_date}-${req.body.longitude}-${req.body.latitude}`);
                let snapshot = await storage.uploadString(image_ref, req.body.image, 'base64', {contentType: 'image/jpeg'})
                let image_url = await storage.getDownloadURL(image_ref)
                sql.query(`INSERT INTO SampleData VALUES (
                    '${req.body.earthquake_id}',
                    '${req.body.collection_date}',
                    '${req.body.sample_type}',
                    '${req.body.longitude}',
                    '${req.body.latitude}',
                    '${req.body.country}',
                    '${location}',
                    '${IsSampleRequired}',
                    '${ItemValue}',
                    '${IsSold}',
                    '${req.body.observations}',
                    '${shop_description}',
                    '${image_url}',
                    '${empty_item_name}'
                )`).then(async _ => {
                    res.status(200).json({message:"Specimen added"});
                    return true;
                }).catch(err => {
                    res.status(500).json({message: "Could not add specimen", errors: err});

                    return false;
                })
            } catch (err) {
                res.status(500).json({message: "Server error", errors: err});

            }
            
        }
    })

})

/**
 * This function handles the GET request to the "/get_all_specimens" endpoint.
 * It retrieves all specimens from the database and sends them as a JSON response.
 *
 * @param {Request} req - The request object representing the HTTP request.
 * @param {Response} res - The response object representing the HTTP response.
 *
 * @returns {void} This function does not return any value.
 *
 * @throws {HTTPError} If there is an error connecting to the database.
 */

router.get("/get_all_specimens", (req, res) => {

    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});

        } else {
            sql.query("SELECT * FROM SampleData").then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not retrieve specimens", errors: err});

                return false;
            })
        }
    })
})


const searchSchema = {
    sample_id: ["number", false],
    earthquake_id: ["number", false],
    collection_date: ['string', false],
    sample_type: ["string", false],
    longitude: ['number', false],
    latitude: ['number', false],
    country: ["string", false],
    current_location: ["string", false],
    is_sample_required: ["number", false],
    item_value: ["number", false],
    is_sold: ["number", false],
    max_price: ["number", false],
    min_price: ["number", false]
}

/**
 * This function handles the POST request to the "/search" endpoint.
 * It searches for specimens based on the provided search parameters and sends the matching results as a JSON response.
 *
 * @param {Request} req - The request object representing the HTTP request.
 * @param {Response} res - The response object representing the HTTP response.
 *
 * @returns {void} This function does not return any value.
 *
 * @throws {HTTPError} If the request body is invalid or if there is an error connecting to the database.
 */

router.post("/search", (req, res) => {
    let search_params = req.body;
    let new_body = {}
    for (let key in search_params){
        if (search_params[key] != null && search_params[key] != "" || search_params[key] === 0){
            new_body[key] = search_params[key];
        }
    }
    search_params = new_body;
    let errors = check_body_schema(search_params, searchSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    let sql_query = [];
    let keys = Object.keys(search_params);

    if (keys.includes("min_price") && keys.includes("max_price")) {
        if (search_params.min_price > search_params.max_price) {
            res.status(400).json({message: "Minimum price is larger than maximum price"});
            return false;
        }
    }

    if (keys.includes("min_price")) {
        sql_query.push(`(item_value >= ${search_params.min_price})`);
    }
    
    if (keys.includes("max_price")) {
        sql_query.push(`(item_value <= ${search_params.max_price})`);
    }

    if (keys.includes("sample_id")) {
        sql_query.push(`(sample_id = ${search_params['sample_id']})`);
    }

    if (keys.includes("earthquake_id")) {
        sql_query.push(`(earthquake_id = ${search_params['earthquake_id']})`);
    }

    if (keys.includes("country")) {
        sql_query.push(`(country = '${search_params['country']}')`);
    }

    if (keys.includes("sample_type")) {
        sql_query.push(`(sample_type = '${search_params['sample_type']}')`);
    }

    if (keys.includes("is_sample_required")) {
        sql_query.push(`(is_sample_required = ${search_params['is_sample_required']})`);
    }

    if (keys.includes("is_sold")) {
        sql_query.push(`(is_sold = ${search_params['is_sold']})`);
    }

    if (sql_query.length == 0) {
        res.status(400).json({message: "No search parameters"});

        return false;
    }

    let query = "SELECT * FROM SampleData WHERE " + sql_query.join(' AND ');
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
            return false;
        } else {
            sql.query(query).then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not complete search", errors: err});
                return false;
            })
        }
    })
})



deleteSchema = {
    sample_id: ["number", true]
}

/**
 * This function handles the POST request to the "/delete" endpoint.
 * It deletes a specimen from the database based on the provided sample ID.
 *
 * @param {Request} req - The request object representing the HTTP request.
 * @param {Response} res - The response object representing the HTTP response.
 *
 * @returns {void} This function does not return any value.
 *
 * @throws {HTTPError} If the request body is invalid or if there is an error connecting to the database.
 */

router.post("/delete", (req, res) => {
    let delete_params = req.body;

    let errors = check_body_schema(delete_params, deleteSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    let keys = Object.keys(delete_params);
    if (keys.length == 0) {
        res.status(400).json({message: "missing sample ID"});

        return false;
    }

    let query;
    query = `DELETE FROM SampleData WHERE sample_id = '${delete_params[keys[0]]}'`

    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});

        } else {
            try{

                sql.query(query
                ).then(_ => {
                    res.status(200).json({message: "Specimen deleted"});
                    return true;
                }).catch(err => {
                    res.status(500).json({message: "Could not delete specimen", errors: err});
                    return false;
                })
            } catch (err) {
                res.status(500).json({message: "Server error", errors: err});

            }
            
        }
    })

})

/**
 * This function handles the GET request to the "/to_sell" endpoint.
 * It retrieves all specimens from the database that are marked as not required, and therefore can be sold.
 *
 * @param {Request} req - The request object representing the HTTP request.
 * @param {Response} res - The response object representing the HTTP response.
 *
 * @returns {void} This function does not return any value.
 *
 * @throws {HTTPError} If there is an error connecting to the database.
 */

router.get("/to_sell", (req, res) => {
    
    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Could not connect to server", errors: err});
        } else {
            sql.query("SELECT * FROM SampleData WHERE is_sample_required = 0").then(sql_res => {
                res.json(sql_res.recordset);
                return true;
            }).catch(err => {
                res.status(500).json({message: "Could not retrieve specimens", errors: err});

                return false;
            })
        }
    })
})


priceSchema = {
    item_value: ["number", true],
    sample_id: ["number", true],
    shop_description: ["string", true],
    item_name: ["string", true]
}

/**
 * This function handles the POST request to the "/add_to_shop" endpoint.
 * It updates the database to mark a specimen as available for sale, and sets the item's price, description, and name.
 *
 * @param {Request} req - The request object representing the HTTP request.
 * @param {Response} res - The response object representing the HTTP response.
 *
 * @returns {void} This function does not return any value.
 *
 * @throws {HTTPError} If the request body is invalid or if there is an error connecting to the database.
 */

router.post("/add_to_shop", (req, res) =>{
    let price_params = req.body;

    let errors = check_body_schema(price_params, priceSchema);
    if (errors.length > 0) {
        res.status(400).json({message: "Invalid request body", errors: errors});
        return false;
    }

    let keys = Object.keys(price_params);
    if (keys.length == 0) {
        res.status(400).json({message: "Missing search parameters"});
        return false;
    }

    let query;
    query = `UPDATE SampleData SET is_sample_required = 0, item_value = '${req.body.item_value}', shop_description = '${req.body.shop_description}', item_name = '${req.body.item_name}' WHERE sample_id = '${req.body.sample_id}'`

    sql.connect(config, async err => {
        if (err) {
            res.status(500).json({message: "Couldn't connect to server", errors: err});
        } else {
            try{

                sql.query(query
                ).then(_ => {
                    res.status(200).json({message: "Item can be sold"});
                    return true;
                }).catch(err => {
                    res.status(500).json({message: "Could not alter item status", errors: err});

                    return false;
                })
            } catch (err) {
                res.status(500).json({message: "SQL error", errors: err});

            }
            
        }
    })
})

router.post("/bulk_add", async (req, res) => {
    let file_id = req.query.file_id;

    let file_id_ref = database.ref(db, `/${file_id}`);
    let snapshot = await database.get(file_id_ref);
    if (!snapshot.exists()){
        res.status(500).json({message: 'could not find file_id'})
        return false;
    }
    console.log(snapshot)
    let files = snapshot.val().split(',');
    let files_to_delete = [];
    for(let i = 0; i < files.length; i++){
        let file = files[i];
        let file_ref = storage.ref(bucket, file);
        let url_res = await storage.getDownloadURL(file_ref);
        let file_req = await fetch(url_res);
        let blob = await file_req.blob();
        let text = await blob.text();
        let rows = text.split("\n");

        for (let j = 1; j < rows.length; j++){
            let row = rows[j].split(",");
            sql.connect(config, async err => {
                if (err){
                    res.status(500).json({message: 'could not connect to server', errors: err})
                    return false;
                }
                console.log(row)
                let q = `INSERT INTO SampleData Values (
                    '${row[0]}',
                    '${row[1]}',
                    '${row[2]}',
                    ${row[3]},
                    ${row[4]},
                    '${row[5]}',
                    'processing',
                    '${IsSampleRequired}',
                    '${ItemValue}',
                    '${IsSold}',
                    '${row[6]}',
                    '${shop_description}',
                    '${row[7]}',
                    '${empty_item_name}'
                )`
                sql.query(q).then( _ => {
                    files_to_delete.push(file_ref)
                }).catch(err => {
                    res.status(500).json({message: 'error adding specimens', errors: err})
                    return false;
                })
            })
        }
    }
    database.remove(file_id_ref);
    

    for (let i=0; i<files_to_delete.length; i++){
        try{
            await storage.deleteObject(files_to_delete[i])
        } catch {
            null
        }
    }
    res.status(200).json({message: "specimens imported successfully"})
    return true;
})


module.exports = router;