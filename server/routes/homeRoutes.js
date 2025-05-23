const { Router } = require("express");
const router = Router();

router.get("/", async (req, res) => {
    res.send(`<h2>Resume analyser server is running</h2>`);
});

module.exports = router;
