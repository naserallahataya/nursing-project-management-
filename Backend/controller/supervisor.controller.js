const Supervisor = require("../models/Supervisor");
const Shift = require("../models/Shift");
const Vacation = require("../models/Vacation");



exports.add_supervisor = async (req, res) => {
  try {
    const sup = await Supervisor.create(req.body);
    res.json({ msg: "Supervisor created", supervisor: sup });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_all_supervisors = async (req, res) => {
  try {
    const list = await Supervisor.find().sort("name");
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.edit_supervisor = async (req, res) => {
  try {
    const { id } = req.params;
    const sup = await Supervisor.findByIdAndUpdate(id, req.body, { new: true });
    if (!sup) return res.status(404).json({ msg: "Supervisor not found" });
    res.json({ msg: "Updated", supervisor: sup });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete_supervisor = async (req, res) => {
  try {
    const { id } = req.params;
    await Supervisor.findByIdAndDelete(id);
    res.json({ msg: "Supervisor deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.search_supervisor = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ msg: "يرجى إدخال اسم للبحث" });
    }

    // 1) البحث عن المشرفة (بحث غير حساس لحالة الأحرف)
    const supervisor = await Supervisor.findOne({
      name: { $regex: name, $options: "i" }
    });

    if (!supervisor) {
      return res.status(404).json({ msg: "لم يتم العثور على مشرفة بهذا الاسم" });
    }

    // 2) جلب جميع المناوبات الخاصة بهذه المشرفة
    const shifts = await Shift.find({ supervisor: supervisor._id })
      .populate("buildId", "number_build")       // إظهار رقم البناء
      .populate("floorId", "number_floor")       // إظهار رقم الطابق
      .sort({ date: 1 });

    // 3) جلب جميع الإجازات الخاصة بها
    const vacations = await Vacation.find({ supervisor: supervisor._id })
      .sort({ start_date: 1 });

    res.json({
      supervisor,
      shifts,
      vacations
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
