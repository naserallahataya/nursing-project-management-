const express = require('express');
const router = express.Router();
const {
    createHospital,
    getHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
    assignStudentToHospital
} = require('../controller/hospital.controller');

router.route('/')
    .post(createHospital)
    .get(getHospitals);

router.route('/:id')
    .get(getHospitalById)
    .put(updateHospital)
    .delete(deleteHospital);

router.post('/assign', assignStudentToHospital);

module.exports = router;

