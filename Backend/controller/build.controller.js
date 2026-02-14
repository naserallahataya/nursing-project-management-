const asyncHandler = require("../middleware/asyncHandler");
const Build = require("../models/build.model");
const Floor = require("../models/floor.model");
const Room = require("../models/room.model");
const User = require("../models/user.model");
const { sendRoomAssignmentEmail } = require("../emailService");





exports.createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json({ success: true, data: room });
});

exports.createFloor = asyncHandler(async (req, res) => {
  const floor = await Floor.create(req.body);
  
  // Update the build to include this floor in its floors array
  if (req.body.build) {
    const build = await Build.findById(req.body.build);
    if (build) {
      // Check if floor is not already in the array
      if (!build.floors.includes(floor._id)) {
        build.floors.push(floor._id);
        await build.save();
      }
    }
  }
  
  res.status(201).json({ success: true, data: floor });
});

exports.createBuild = asyncHandler(async (req, res) => {
  const build = await Build.create(req.body);
  res.status(201).json({ success: true, data: build });
});


exports.get_all_builds = async (req, res) => {
  try {
    const builds = await Build.find().populate({
      path: "floors",
      populate: { path: "rooms" },
    });

    const result = builds.map((build) => ({
      _id: build._id,
      build_number: build.number_build,
      floors_count: build.floors.length,
      floors: build.floors.map((floor) => ({
        _id: floor._id,
        floor_number: floor.number_floor,
        rooms_count: floor.rooms.length,
      })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_available_build = async (req, res) => {
  try {
    const builds = await Build.find().populate({
      path: "floors",
      populate: { path: "rooms" }
    });

    const availableBuilds = builds.filter((build) => {
      return build.floors.some((floor) =>
        floor.rooms.some((room) => room.students.length < room.capacity)
      );
    });

    res.json(availableBuilds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_all_floors = async (req, res) => {
  try {
    const floors = await Floor.find().populate("rooms");
    res.json(floors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_available_floor = async (req, res) => {
  try {
    const floors = await Floor.find().populate("rooms");

    const availableFloors = floors.filter((floor) => {
      return floor.rooms.some((room) => room.students.length < room.capacity);
    });

    res.json(availableFloors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_all_rooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    const fullRoomsInfo = [];

    for (const room of rooms) {
      // إيجاد الطابق الذي يحتوي الغرفة
      const floor = await Floor.findOne({ rooms: room._id });

      // إيجاد البناء الذي يحتوي الطابق
      const build = floor
        ? await Build.findOne({ floors: floor._id })
        : null;

      fullRoomsInfo.push({
        _id: room._id,
        number_room: room.number_room,
        capacity: room.capacity,
        students_count: room.students.length,
        empty_spaces: room.capacity - room.students.length,
        floor_number: floor ? floor.number_floor : null,
        build_number: build ? build.number_build : null,
      });
    }

    res.json({
      Count_rooms: rooms.length,  // عدد الغرف الكلي
      rooms: fullRoomsInfo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_available_room = async (req, res) => {
 try {
    const rooms = await Room.find();

    const availableRooms = [];
    const fullRooms = [];
    let totalEmptySpaces = 0;

    for (const room of rooms) {
      // إيجاد الطابق الذي يحتوي الغرفة
      const floor = await Floor.findOne({ rooms: room._id });

      // إيجاد البناء الذي يحتوي الطابق
      const build = floor
        ? await Build.findOne({ floors: floor._id })
        : null;

      const roomInfo = {
        _id: room._id,
        number_room: room.number_room,
        capacity: room.capacity,
        students_count: room.students.length,
        empty_spaces: room.capacity - room.students.length,
        floor_number: floor ? floor.number_floor : null,
        build_number: build ? build.number_build : null,
      };

      if (room.students.length < room.capacity) {
        availableRooms.push(roomInfo);
        totalEmptySpaces += room.capacity - room.students.length;
      } else {
        fullRooms.push(roomInfo);
      }
    }

    res.json({
      availableRooms,
      availableRoomsCount:availableRooms.length,
      fullRoomsCount:fullRooms.length,
      totalEmptySpaces,
      totalRoomsCount: rooms.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_room_info = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const room = await Room.findById(roomId).populate("students");

    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    const currentStudents = room.students.length;
    const emptySpaces = room.capacity - currentStudents;

    res.json({
      number_room: room.number_room,
      capacity: room.capacity,
      current_students: currentStudents,
      empty_spaces: emptySpaces,
      students: room.students, // تحتوي كل معلومات الطلاب
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.edit_room_info = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { capacity } = req.body;

    const room = await Room.findById(roomId);

    if (!room) return res.status(404).json({ msg: "Room not found" });

    // ممنوع تقليل السعة أقل من عدد الطلاب الموجودين
    if (capacity < room.students.length) {
      return res.status(400).json({
        msg: "Capacity cannot be less than current number of students"
      });
    }

    room.capacity = capacity;
    await room.save();

    res.json({ msg: "Room updated successfully", room });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.add_student_to_room = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { studentId } = req.body;

    const room = await Room.findById(roomId);
    const student = await User.findById(studentId);

    if (!room) return res.status(404).json({ msg: "Room not found" });
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // هل يوجد فراغ؟
    if (room.students.length >= room.capacity) {
      return res.status(400).json({ msg: "Room is full" });
    }

    // هل الطالبة موجودة أصلًا بالغرفة؟
    if (room.students.includes(studentId)) {
      return res.status(400).json({ msg: "Student already in this room" });
    }

    // إضافة الطالبة للغرفة
    room.students.push(studentId);
    await room.save();

    // تحديث الطالب
    student.roomId = roomId;
    await student.save();

    // Send email notification
    try {
      // Find the floor and building for this room
      const floor = await Floor.findOne({ rooms: roomId });
      let building = null;
      if (floor) {
        building = await Build.findOne({ floors: floor._id });
      }

      // Send email notification (non-blocking)
      sendRoomAssignmentEmail(student, room, building, floor).catch(err => {
        console.error('Failed to send room assignment email:', err);
      });
    } catch (emailError) {
      console.error('Error preparing email notification:', emailError);
      // Continue even if email fails
    }

    res.json({ msg: "Student added to room successfully", room });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete_student_from_room = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { studentId } = req.body;

    const room = await Room.findById(roomId);
    const student = await User.findById(studentId);

    if (!room) return res.status(404).json({ msg: "Room not found" });
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // هل الطالبة ليست في الغرفة؟
    if (!room.students.includes(studentId)) {
      return res.status(400).json({ msg: "Student not found in this room" });
    }

    // إزالة الطالبة من المصفوفة
    room.students = room.students.filter(id => id.toString() !== studentId);
    await room.save();

    // تحديث الطالب
    student.roomId = null;
    await student.save();

    res.json({ msg: "Student removed from room successfully", room });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.auto_assign_students = async (req, res) => {
  try {
    // 1) الطلاب غير الموزعين
    const students = await User.find({
      status: "student",
      roomId: null
    });

    if (students.length === 0) {
      return res.json({ msg: "No unassigned students found!" });
    }

    // 2) الغرف المتاحة (اللي فيها فراغ)
    const rooms = await Room.find();

    const availableRooms = rooms.filter(
      room => room.students.length < room.capacity
    );

    if (availableRooms.length === 0) {
      return res.json({ msg: "No available rooms found!" });
    }

    // 3) خلط الطلاب عشوائيًا
    let shuffledStudents = students.sort(() => Math.random() - 0.5);

    // 4) توزيع الطلاب
    let index = 0;
    for (let room of availableRooms) {
      while (
        room.students.length < room.capacity &&
        index < shuffledStudents.length
      ) {
        const student = shuffledStudents[index];

        // إضافة الطالبة للغرفة
        room.students.push(student._id);
        await room.save();

        // تحديث الطالب
        student.room= room._id;
        await student.save();

        index++;
      }
    }

    // عدد الطالبات الذين تم فرزهم فعليًا
    const assignedCount = index;

    res.json({
      msg: "Students assigned successfully!",
      assigned: assignedCount,
      remaining: shuffledStudents.length - assignedCount,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};