const express = require('express');
const router = express.Router();
const { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, getStudentsWithoutRoom } = require('../controller/student.controller');


router.route('/no-room')
    .get(getStudentsWithoutRoom);

router.route('/')
    .post(createStudent)
    .get(getStudents);

router.route('/:id')
    .get(getStudentById)
    .put(updateStudent)
    .delete(deleteStudent);

module.exports = router;