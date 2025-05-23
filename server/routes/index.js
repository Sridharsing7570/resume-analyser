const { Router } = require("express");
const router = Router();

router.use("/api", require("./resumeRoutes"));
router.use("/", require("../routes/homeRoutes"));

module.exports = router;
