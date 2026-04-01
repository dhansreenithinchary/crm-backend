const router = require("express").Router();
const { getLeads, updateLead, assignLeads, importLeads, autoAssignLeads, getUnassignedCount, } = require("../controllers/leadController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/", getLeads);
router.put("/:id", updateLead);
router.post("/assign", assignLeads);
router.post("/import", upload.single("file"), importLeads);
router.post("/auto-assign", autoAssignLeads);
router.get("/unassigned-count", getUnassignedCount);

module.exports = router;