const express = require('express');


const adminCtrl = require('../controller/adminController');



const router = express.Router();

router.post("/login", adminCtrl.loginAdmin);
router.post("/create", adminCtrl.createAdmin);

module.exports = router;
