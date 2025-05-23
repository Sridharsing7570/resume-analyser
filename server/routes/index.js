const { Router } = require("express");
const router = Router();

router.use("/api", require("./resumeRoutes"));

module.exports = router;
