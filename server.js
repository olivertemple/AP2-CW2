const express = require("express");
const path = require("path");

const app = express();

const port = 3000;

app.use(express.json()) //This parses incoming requests as JSON payloads

// app.use(express.static(path.resolve(__dirname, "../FRONTENDNAME/build"))) //This is to serve the ionic page

app.get("/", (req, res) => {
    res.json({key: "value"})
})

app.listen(port, (err) => {
    err ? console.log(err) : console.log(`Listening on port ${port}`)
});