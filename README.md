# AP2-CW2 Backend

## Setup and Running
This is a backend written in javascript using express.
To setup, make sure you have node v20.11.1 and npm v10.2.4 or v10.2.5. In the root of this repository, run `npm install` to install all of the dependencies you will need for this to work.

To run the backend, you can either run `npm run start` or `node server.js`.

If you want to serve the front end from the backend you will need to download the latest stable release from the front end repo [here](https://github.com/Ollie-White/EarthquakeFrontend/releases) and place the www folder in ./frontend_build/. Alternatively, if you want to run a custom build, you will need to build the frontend using the command `ionic build` in the folder EarthquakeFrontend/EarthquakeFrontend. This will create the www folder where the build files are located, which need to be moved into the ./frontend_build/ directory.

The relative path from server.js to the www folder needs to be correct for it to work. You will also need the .env file so that api keys and server credentials can be loaded.

## Repository Structure
```
AP2-Cw2
└─── server.js - the main file for the backend server
│
└─── database - a collection of scripts for managing the database (create tables, drop tables etc)
│
└───routes
│   │─── earthquake.js - contains the API routes for the earthquake endpoints
│   │─── observatory.js - contains the API routes for the observatory endpoints
│   │─── specimen.js - contains the API routes for the specimen endpoints
│   │─── transaction.js - contains the API routes for the transaction endpoints
│   │─── users.js - contains the API routes for the users endpoints
│   └─── example_endpoints.js - contains an example endpoint created by Oliver to allow others to get started making endpoints
│
└─── utils - global methods to reduce repetition
│
└─── email_service - contains the AWS lambda function for sending emails to users (Dyson firewall block this)
│
└─── logs - logs from the backend server
|
└─── frontend_build
        └─── www - build of the frontend website to improve performance
```

