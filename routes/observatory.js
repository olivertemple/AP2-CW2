const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({endpoint: "observatory"})
})

module.exports = router;