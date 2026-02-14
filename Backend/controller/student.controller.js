const User = require('../models/user.model');
const asyncHandler = require("../middleware/asyncHandler");
const mongoose = require('mongoose');
const { sendRoomAssignmentEmail } = require("../emailService");
const Room = require('../models/room.model');
const Floor = require('../models/floor.model');
const Build = require('../models/build.model');

const createStudent = asyncHandler(async (req, res) => {
    try {
        // Clean up the data: convert empty strings to null/undefined for optional ObjectId fields
        const cleanedData = { ...req.body };
        
        // Helper function to validate and clean ObjectId fields
        const cleanObjectIdField = (value) => {
            if (!value || value === '' || value === undefined) {
                return null;
            }
            // Check if it's a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(value)) {
                return value;
            }
            // If not valid, return null
            return null;
        };
        
        // Convert empty strings, undefined, or invalid values to null for optional ObjectId fields
        // Room is optional - allow null/undefined
        cleanedData.room = cleanObjectIdField(cleanedData.room);
        
        // Building is optional
        cleanedData.building = cleanObjectIdField(cleanedData.building);
        
        // Floor - handle empty strings but keep if valid (since it might be required)
        if (cleanedData.floor === '' || cleanedData.floor === undefined) {
            cleanedData.floor = null;
        } else if (cleanedData.floor && !mongoose.Types.ObjectId.isValid(cleanedData.floor)) {
            // If floor is provided but invalid, set to null
            cleanedData.floor = null;
        }
        
        // Hospital is optional
        cleanedData.hospital = cleanObjectIdField(cleanedData.hospital);

        const student = await User.create(cleanedData);

        // Send email notification if room is assigned
        if (cleanedData.room) {
            try {
                // Find the room, floor, and building
                const room = await Room.findById(cleanedData.room);
                let floor = null;
                let building = null;

                if (room) {
                    // Find the floor that contains this room
                    floor = await Floor.findOne({ rooms: cleanedData.room });
                    if (floor && cleanedData.floor) {
                        // Use the floor from cleanedData if available, otherwise use the found floor
                        floor = await Floor.findById(cleanedData.floor) || floor;
                    }
                    
                    // Find the building that contains this floor
                    if (floor) {
                        building = await Build.findOne({ floors: floor._id });
                        if (building && cleanedData.building) {
                            // Use the building from cleanedData if available
                            building = await Build.findById(cleanedData.building) || building;
                        }
                    }
                }

                // Send email notification (non-blocking)
                if (student.email) {
                    sendRoomAssignmentEmail(student, room, building, floor).catch(err => {
                        console.error('Failed to send room assignment email:', err);
                    });
                }
            } catch (emailError) {
                console.error('Error preparing email notification:', emailError);
                // Continue even if email fails
            }
        }

        res.status(201).json({
            success: true,
            data: student,
        });

    } catch (error) {
        console.error('Error creating student:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
                field: "email",
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = {};
            Object.keys(error.errors).forEach(key => {
                errorMessages[key] = error.errors[key].message;
            });
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errorMessages,
                details: error.errors
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
});

const getStudents = asyncHandler(async (req, res) => {
    const { name, status, specialization } = req.query;

    let query = {};

    if (name) query.name = { $regex: name, $options: "i" };


    if (status) query.status = status;


    if (specialization) query.specialization = specialization;

    const students = await User.find(query)

        .populate("room")
        .populate("building")
        .populate("floor");

    res.status(200).json({
        success: true,
        count: students.length,
        data: students,
    });
});

const getStudentById = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.id)
        .populate({
            path: "hospital",
            populate: [
                { path: "city" },
                { path: "department" },
                { path: "supervisor" }
            ]
        })
        .populate("room")
        .populate("building")
        .populate("floor");

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student not found",
        });
    }

    res.status(200).json({
        success: true,
        data: student,
    });
});


const updateStudent = asyncHandler(async (req, res) => {
    const student = await User.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
    );

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student not found",
        });
    }

    res.status(200).json({
        success: true,
        data: student,
    });
});


const deleteStudent = asyncHandler(async (req, res) => {
    const student = await User.findByIdAndDelete(req.params.id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Student deleted successfully",
    });
});


const getStudentsWithoutRoom = asyncHandler(async (req, res) => {

    const students = await User.find({
        status: "student",
        $or: [
            { room: null },
            { room: { $exists: false } },
            { room: { $in: [null, undefined] } }
        ]
    })
        .populate("hospital")
        .populate({
            path: "building",
            match: { _id: { $exists: true } }
        })
        .populate({
            path: "floor",
            match: { _id: { $exists: true } }
        });

    res.status(200).json({
        success: true,
        count: students.length,
        data: students
    });
});


module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentsWithoutRoom
};
