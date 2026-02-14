
const parseTime = (dateOnly, timeStr) => {

  const [hh, mm] = timeStr.split(":").map(Number);
  const d = new Date(dateOnly);
  d.setHours(hh, mm, 0, 0);
  return d;
};

const overlap = (aStart, aEnd, bStart, bEnd) => {
  return aStart < bEnd && bStart < aEnd;
};

const durationHours = (start, end) => {
  return (end - start) / (1000 * 60 * 60);
};

module.exports = { parseTime, overlap, durationHours };
