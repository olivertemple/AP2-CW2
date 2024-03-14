# AP2-CW2 Backend

This is a backend written in javascript using express.
To setup, make sure you have node v20.11.1 and npm v10.2.4 or v10.2.5. In the root of this repository, run `npm install` to install all of the dependencies you will need for this to work.

To run the backend, you can either run `npm run start` or `node server.js`.

If you want to serve the front end from the backend you will need to download the latest stable release from the front end repo [here](https://github.com/Ollie-White/EarthquakeFrontend/releases) and place the www folder in ./frontend_build/. Alternatively, if you want to run a custom build, you will need to build the frontend using the command `ionic build` in the folder EarthquakeFrontend/earthquake-frontend. This will create the www folder where the build files are located, which need to be moved into the ./frontend_build/ directory.

The relative path from server.js to the www folder needs to be correct for it to work. If you clone this repo and the front end repo into the same folder (so they are side by side) you should be okay.

lmk if you have any questions.
