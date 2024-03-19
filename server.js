const express = require("express");
const path = require("path");

const app = express();

const port = 3000;

const earthquakeRoutes = require("./routes/earthquake");

app.use(express.json()) //This parses incoming requests as JSON payloads

//If there is no build in the ./frontend_build/ folder then this won't work. You can download the latest stable build from github
app.use(express.static(path.resolve(__dirname, "./frontend_build/www"))) //This is to serve the ionic page

app.use("/api/earthquake", earthquakeRoutes);

app.listen(port, (err) => {
    err ? console.log(err) : console.log(`Listening on port ${port}`)
});
