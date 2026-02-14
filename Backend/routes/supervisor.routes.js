const express = require("express");
const router = express.Router();
const ctrl = require("../controller/supervisor.controller");

router.post("/add", ctrl.add_supervisor);
router.get("/all", ctrl.get_all_supervisors);
router.put("/edit/:id", ctrl.edit_supervisor);
router.delete("/delete/:id", ctrl.delete_supervisor);

router.get("/search", ctrl.search_supervisor); //?name=sarah

module.exports = router;
