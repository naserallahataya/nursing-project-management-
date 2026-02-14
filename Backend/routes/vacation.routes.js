const express = require("express");
const router = express.Router();
const ctrl = require("../controller/vacation.controller");

router.post("/add", ctrl.add_vacation);
router.get("/supervisor/:id", ctrl.get_supervisor_vacations);
router.delete("/delete/:id", ctrl.delete_vacation);

module.exports = router;