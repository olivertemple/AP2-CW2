const express = require("express");
const path = require("path");

const app = express();

const port = 3000;

app.use(express.json()) //This parses incoming requests as JSON payloads

//You need to ensure that you have run 'ionic build' in the front end repo and that this relative path is correct for your system for this to work.
app.use(express.static(path.resolve(__dirname, "./frontend_build/www"))) //This is to serve the ionic page

app.get("/api", (req, res) => {
    res.json({key: "value"})
})

app.listen(port, (err) => {
    err ? console.log(err) : console.log(`Listening on port ${port}`)
});
