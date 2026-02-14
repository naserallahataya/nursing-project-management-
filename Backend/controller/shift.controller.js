const Shift = require("../models/Shift");
const Vacation = require("../models/Vacation");
const Supervisor = require("../models/Supervisor");
const Build = require("../models/build.model"); 
const Floor = require("../models/floor.model"); 

const { parseTime, overlap, durationHours } = require("../utils/timeHelpers");
const { sendShiftAssignmentEmail } = require("../emailService");


const supervisorOnVacation = async (supervisorId, dateObj) => {
  const dateOnly = new Date(dateObj);
  dateOnly.setHours(0,0,0,0);
  const vac = await Vacation.findOne({
    supervisor: supervisorId,
    start_date: { $lte: dateOnly },
    end_date: { $gte: dateOnly }
  });
  return !!vac;
};


const hasOverlappingShift = async (supervisorId, dateOnly, newStart, newEnd, excludeShiftId = null) => {
  const shifts = await Shift.find({ supervisor: supervisorId, date: dateOnly });
  for (let s of shifts) {
    if (excludeShiftId && s._id.toString() === excludeShiftId) continue;
    const sStart = parseTime(s.date, s.start_time);
    const sEnd = parseTime(s.date, s.end_time);
    if (overlap(sStart, sEnd, newStart, newEnd)) return s;
  }
  return null;
};

exports.add_shift = async (req, res) => {
  try {
    const { date, start_time, end_time, buildId, floorId, supervisor, note, createdBy } = req.body;

    // basic checks
    if (!date || !start_time || !end_time || !buildId || !floorId || !supervisor) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const dateOnly = new Date(date);
    dateOnly.setHours(0,0,0,0);

    // validate build & floor exist
    const build = await Build.findById(buildId);
    const floor = await Floor.findById(floorId);
    if (!build) return res.status(404).json({ msg: "Build not found" });
    if (!floor) return res.status(404).json({ msg: "Floor not found" });

    // check supervisor exists
    const sup = await Supervisor.findById(supervisor);
    if (!sup) return res.status(404).json({ msg: "Supervisor not found" });

    // check vacation
    const onVac = await supervisorOnVacation(supervisor, dateOnly);
    if (onVac) return res.status(400).json({ msg: "Supervisor is on vacation this date" });

    // parse start/end datetimes
    const startDT = parseTime(dateOnly, start_time);
    const endDT = parseTime(dateOnly, end_time);

    if (endDT <= startDT) {
      return res.status(400).json({ msg: "end_time must be after start_time" });
    }

    // duration <= 6 hours
    const dur = durationHours(startDT, endDT);
    if (dur > 6) {
      return res.status(400).json({ msg: "Shift duration cannot exceed 6 hours" });
    }

    // check overlapping shifts for this supervisor on that date
    const conflictShift = await hasOverlappingShift(supervisor, dateOnly, startDT, endDT);
    if (conflictShift) {
      return res.status(400).json({
        msg: "Supervisor already has an overlapping shift",
        conflict: conflictShift
      });
    }

    
    const shift = await Shift.create({ date: dateOnly, start_time, end_time, buildId, floorId, supervisor, note, createdBy });
    const populated = await Shift.findById(shift._id).populate("supervisor buildId floorId");
    
    // Send email notification to supervisor
    try {
      sendShiftAssignmentEmail(sup, populated, build, floor).catch(err => {
        console.error('Failed to send shift assignment email:', err);
      });
    } catch (emailError) {
      console.error('Error preparing email notification:', emailError);
      // Continue even if email fails
    }
    
    res.json({ msg: "Shift created", shift: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_supervisor_shifts = async (req, res) => {
  try {
    const { id } = req.params;
    const shifts = await Shift.find({ supervisor: id }).populate("buildId floorId supervisor").sort({ date: 1, start_time: 1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_shifts_by_date = async (req, res) => {
  try {
    const { date } = req.params; // expecting YYYY-MM-DD
    const dateOnly = new Date(date);
    dateOnly.setHours(0,0,0,0);
    const shifts = await Shift.find({ date: dateOnly }).populate("buildId floorId supervisor").sort({ start_time: 1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.edit_shift = async (req, res) => {
  try {
    const { id } = req.params;
    const changes = req.body;

    const existing = await Shift.findById(id);
    if (!existing) return res.status(404).json({ msg: "Shift not found" });

    // If changing date/start/end/supervisor, need to re-validate
    const dateOnly = changes.date ? new Date(changes.date) : existing.date;
    dateOnly.setHours(0,0,0,0);

    const start_time = changes.start_time || existing.start_time;
    const end_time = changes.end_time || existing.end_time;
    const supervisor = changes.supervisor || existing.supervisor;

    const startDT = parseTime(dateOnly, start_time);
    const endDT = parseTime(dateOnly, end_time);
    if (endDT <= startDT) return res.status(400).json({ msg: "end_time must be after start_time" });

    const dur = (endDT - startDT) / (1000*60*60);
    if (dur > 6) return res.status(400).json({ msg: "Shift duration cannot exceed 6 hours" });

    // check vacation for supervisor
    const onVac = await Vacation.findOne({
      supervisor,
      start_date: { $lte: dateOnly },
      end_date: { $gte: dateOnly }
    });
    if (onVac) return res.status(400).json({ msg: "Supervisor is on vacation this date" });

    const conflictShift = await hasOverlappingShift(supervisor, dateOnly, startDT, endDT, id);
    if (conflictShift) {
      return res.status(400).json({ msg: "Supervisor has an overlapping shift", conflict: conflictShift });
    }

    if (changes.buildId) {
      const Build = require("../models/build.model");
      const b = await Build.findById(changes.buildId);
      if (!b) return res.status(404).json({ msg: "Build not found" });
    }
    if (changes.floorId) {
      const Floor = require("../models/floor.model");
      const f = await Floor.findById(changes.floorId);
      if (!f) return res.status(404).json({ msg: "Floor not found" });
    }

    const updated = await Shift.findByIdAndUpdate(id, {
      ...changes,
      date: dateOnly,
      start_time,
      end_time,
      supervisor
    }, { new: true }).populate("supervisor buildId floorId");

    res.json({ msg: "Shift updated", shift: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete_shift = async (req, res) => {
  try {
    const { id } = req.params;
    await Shift.findByIdAndDelete(id);
    res.json({ msg: "Shift deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_week_schedule = async (req, res) => {
  try {
    const { start } = req.query;
    if (!start) return res.status(400).json({ msg: "start query param required (YYYY-MM-DD)" });

    const startDate = new Date(start);
    startDate.setHours(0,0,0,0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23,59,59,999);

    const shifts = await Shift.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate("supervisor buildId floorId").sort({ date: 1, start_time: 1 });

    res.json({ start: startDate, end: endDate, shifts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFloorsWithoutSupervisor = async (req, res) => {
    try {
        const { date } = req.params;

        if (!date) {
            return res.status(400).json({ msg: "يرجى إرسال التاريخ" });
        }

        // عمل نطاق يوم كامل بدل مقارنة حرفية
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        // 1. جيب كل الشفتات لهذا اليوم بالكامل
        const shifts = await Shift.find({
            date: { $gte: start, $lte: end }
        });

        // الطوابق المشغولة
        const busyFloors = shifts.map(s => s.floorId.toString());

        // 2. جيب كل الأبنية مع طوابقها
        const buildings = await Build.find().populate("floors");

        let emptyFloors = [];

        buildings.forEach(building => {
            building.floors.forEach(floor => {
                if (!busyFloors.includes(floor._id.toString())) {
                    emptyFloors.push({
                        building_id: building._id,
                        building_number: building.number_build,
                        floor_id: floor._id,
                        floor_number: floor.number_floor,
                    });
                }
            });
        });

        return res.json(emptyFloors);

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "خطأ بالخادم" });
    }
};

