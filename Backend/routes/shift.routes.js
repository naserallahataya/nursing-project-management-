const express = require("express");
const router = express.Router();
const ctrl = require("../controller/shift.controller");

router.post("/add", ctrl.add_shift); 
router.get("/supervisor/:id", ctrl.get_supervisor_shifts);
router.get("/date/:date", ctrl.get_shifts_by_date);
router.put("/edit/:id", ctrl.edit_shift);
router.delete("/delete/:id", ctrl.delete_shift);

// weekly schedule
router.get("/week", ctrl.get_week_schedule); // ?start=YYYY-MM-DD
router.get("/empty-floors/:date", ctrl.getFloorsWithoutSupervisor);


module.exports = router;