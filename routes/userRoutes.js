const router = require("express").Router();
const { getUsers, createUser, getAssignHistory } = require("../controllers/userController");

router.get("/", getUsers);
router.post("/", createUser); // ✅ ADD THIS
router.get("/assign-history", getAssignHistory);

module.exports = router;