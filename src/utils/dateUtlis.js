import { startOfWeek, addDays, addHours, addMinutes, format, parse } from 'date-fns';

export const getWeekDays = (date) => {
  let start = startOfWeek(date);
  let days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
};

// export const getDayHours = (date) => {
//   let start = new Date(date.setHours(9, 0, 0, 0)); // Start from 9:00 AM
//   let hours = [];
//   for (let i = 0; i < 8; i++) { // Generate hours from 9:00 AM to 4:00 PM
//     let hour = addHours(start, i);
//     hours.push({
//       time: format(hour, 'HH:mm'),
//       date: hour.toString(),
//     });
//   }
//   return hours;
// };

export const getDayHours = (date) => {
  let start = new Date(date);
  start.setHours(9, 0, 0, 0); // Start from 9:00 AM

  const hours = [];

  for (let i = 0; i < 8; i++) { // Generate hours from 9:00 AM to 4:00 PM
    let hour = addHours(start, i);

    // Push the hour itself
    hours.push({
      time: format(hour, 'HH:mm'),
      date: hour.toString(),
      slots: [], // Initialize slots array for each hour
    });

    // Generate 4 slots per hour (15-minute intervals)
    for (let j = 0; j < 4; j++) {
      const slotHour = addMinutes(hour, j * 15); // Calculate the current slot hour
      hours[i].slots.push(format(slotHour, 'HH:mm')); // Push formatted time slot (HH:mm) to the slots array
    }
  }

  return hours;
};



export const formatDate = (date, formatString = 'yyyy-MM-dd') => format(date, formatString);
export const parseDate = (dateString, formatString = 'yyyy-MM-dd') => parse(dateString, formatString, new Date());
