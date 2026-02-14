const express = require('express');
const router = express.Router();
const buildCtrl = require('../controller/build.controller');

// Build routes
router.get('/builds', buildCtrl.get_all_builds);
router.get('/builds/available', buildCtrl.get_available_build);

// Floor routes
router.post('/floors', buildCtrl.createFloor);
router.get('/floors', buildCtrl.get_all_floors);
router.get('/floors/available', buildCtrl.get_available_floor);

// Room routes
router.get('/rooms', buildCtrl.get_all_rooms);
router.get('/rooms/available', buildCtrl.get_available_room);
router.get('/rooms/:roomId', buildCtrl.get_room_info);
router.put('/rooms/:roomId', buildCtrl.edit_room_info);
router.post('/rooms/:roomId/students', buildCtrl.add_student_to_room);
router.delete('/rooms/:roomId/students', buildCtrl.delete_student_from_room);
router.post("/rooms", buildCtrl.createRoom);
router.post("/builds", buildCtrl.createBuild);

// Auto-assign route
router.post('/auto-assign', buildCtrl.auto_assign_students);

module.exports = router;
