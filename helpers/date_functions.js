function convertDate(d) {
  return d.constructor === Date //2000-01-01
    ? d
    : d.constructor === Array //[2000,01,01]
    ? new Date(d[0], d[1], d[2])
    : d.constructor === Number //234984328998
    ? new Date(d)
    : d.constructor === String //""
    ? new Date(d)
    : typeof d === "object"
    ? new Date(d.year, d.month, d.date)
    : NaN;
}
function compareDate(a, b) {
  return isFinite((a = convertDate(a).valueOf())) &&
    isFinite((b = convertDate(b).valueOf()))
    ? (a > b) - (a < b)
    : NaN;
}

function inRangeDate(d, start, end) {
  return isFinite((d = convertDate(d).valueOf())) &&
    isFinite((start = convertDate(start).valueOf())) &&
    isFinite((end = convertDate(end).valueOf()))
    ? start <= d && d <= end
    : NaN;
}

module.exports = {
  convertDate,
  compareDate,
  inRangeDate,
};
