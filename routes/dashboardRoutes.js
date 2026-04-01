const router = require("express").Router();
const { getDashboardStats, getAnalytics } = require("../controllers/dashboardController");

router.get("/", getDashboardStats);
router.get("/analytics", getAnalytics);

module.exports = router;