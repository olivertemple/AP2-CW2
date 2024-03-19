const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({key: "test value"})
})

module.exports = router;