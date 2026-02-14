const Hospital = require("../models/hospital.model");
const User = require("../models/user.model");

// ---------------------
// Create Hospital
// ---------------------
exports.createHospital = async (req, res) => {
    try {
        const { name, vacancies } = req.body;

        const hospital = await Hospital.create({
            name,
            vacancies,
            students: []
        });

        res.status(201).json({
            message: "Hospital created successfully",
            data: hospital
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ---------------------
// Get All Hospitals
// ---------------------
exports.getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find().populate("students");

        res.status(200).json(hospitals);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ---------------------
// Get Hospital By ID
// ---------------------
exports.getHospitalById = async (req, res) => {
    try {
        const { id } = req.params;
        const hospital = await Hospital.findById(id).populate("students");

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        res.status(200).json(hospital);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ---------------------
// Update Hospital
// ---------------------
exports.updateHospital = async (req, res) => {
    try {
        const { id } = req.params;

        const hospital = await Hospital.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        res.status(200).json({
            message: "Hospital updated",
            data: hospital
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ---------------------
// Delete Hospital
// ---------------------
exports.deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;

        const hospital = await Hospital.findByIdAndDelete(id);

        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        res.status(200).json({ message: "Hospital deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -----------------------------------------------------------
// Assign Student to Hospital (important for your system)
// -----------------------------------------------------------
exports.assignStudentToHospital = async (req, res) => {
    try {
        const { hospitalId, studentId } = req.body;

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) return res.status(404).json({ message: "Hospital not found" });

        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        if (hospital.vacancies <= 0) {
            return res.status(400).json({ message: "No vacancies left" });
        }

        // add student
        hospital.students.push(studentId);
        hospital.vacancies -= 1;
        await hospital.save();

        // update student hospital field
        student.hospital = hospitalId;
        await student.save();

        res.status(200).json({
            message: "Student assigned successfully",
            data: hospital
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
