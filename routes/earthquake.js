const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({endpoint: "earthquake"})
})

module.exports = router;