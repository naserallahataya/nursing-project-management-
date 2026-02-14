const Vacation = require("../models/Vacation");
const Shift = require("../models/Shift");
const { parseTime } = require("../utils/timeHelpers");

exports.add_vacation = async (req, res) => {
  try {
    const { supervisor, start_date, end_date, reason, note, createdBy } = req.body;

    const sDate = new Date(start_date);
    const eDate = new Date(end_date);
    if (eDate < sDate) 
      return res.status(400).json({ msg: "end_date must be after start_date" });

    // 🟦 1) تحقق: هل عندها شفتات بهالفترة؟
    const conflictingShifts = await Shift.find({
      supervisor,
      date: { $gte: sDate, $lte: eDate }
    }).populate("buildId floorId");

    if (conflictingShifts.length > 0) {
      return res.status(400).json({
        msg: "Cannot add vacation: supervisor has assigned shifts inside this period",
        conflicts: conflictingShifts
      });
    }

    // 🟦 2) تحقق: هل عندها إجازة بتتداخل مع الإجازة الجديدة؟
    const overlappingVacations = await Vacation.find({
      supervisor,
      $or: [
        { start_date: { $lte: eDate }, end_date: { $gte: sDate } }
      ]
    });

    if (overlappingVacations.length > 0) {
      return res.status(400).json({
        msg: "Supervisor already has a vacation overlapping this period",
        overlaps: overlappingVacations
      });
    }

    // 🟦 3) إنشاء الإجازة
    const vac = await Vacation.create({
      supervisor,
      start_date: sDate,
      end_date: eDate,
      reason,
      note,
      createdBy
    });

    res.json({ msg: "Vacation added", vacation: vac });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_supervisor_vacations = async (req, res) => {
  try {
    const { id } = req.params;
    const vacs = await Vacation.find({ supervisor: id }).sort({ start_date: -1 });
    res.json(vacs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete_vacation = async (req, res) => {
  try {
    const { id } = req.params;
    await Vacation.findByIdAndDelete(id);
    res.json({ msg: "Vacation deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
