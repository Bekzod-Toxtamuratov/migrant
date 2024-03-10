function addMinutesToDate(date, minutes) {
  
  return new Date(date.getTime() + minutes * 60000);
} 
module.exports = {
  addMinutesToDate,
};
// const date = new Date();

// console.log(date);
// console.log(date.getTime());

// console.log(new Date(date.getTime() + 3*60000));

// console.log("now.getTime() ", now.getTime());
// console.log("new Date() : ", new Date());



