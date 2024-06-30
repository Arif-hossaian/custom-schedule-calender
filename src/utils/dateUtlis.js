import { startOfWeek, addDays, addHours, addMinutes, format, parse, startOfMonth, endOfMonth, endOfWeek,  eachDayOfInterval } from 'date-fns';


export const getWeekDays = (date) => {
  let start = startOfWeek(date);
  let days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
};


// export const getDayHours = (date, interval) => {
//   let start = new Date(date);
//   start.setHours(9, 0, 0, 0); // Start from 9:00 AM

//   const hours = [];

//   for (let i = 0; i < 8; i++) { // Generate hours from 9:00 AM to 4:00 PM
//     let hour = addHours(start, i);

//     // Push the hour itself
//     hours.push({
//       time: format(hour, 'hh:mm a'), // Format to 12-hour with AM/PM
//       date: hour.toString(),
//       slots: [], // Initialize slots array for each hour
//     });

//     // Generate 4 slots per hour (15-minute intervals)
//     for (let j = 0; j < 4; j++) {
//       const slotHour = addMinutes(hour, j * interval); // Calculate the current slot hour
//       hours[i].slots.push(format(slotHour, 'hh:mm a')); // Push formatted time slot (hh:mm a) to the slots array
//     }
//   }

//   return hours;
// };


export const getDayHours = (date, interval) => {
  //console.log(date, 'date in loop')
  let start = new Date(date);
  start.setHours(9, 0, 0, 0); // Start from 9:00 AM

  const hours = [];

  for (let i = 0; i < 8; i++) { // Generate hours from 9:00 AM to 4:00 PM
    let hour = addHours(start, i);

    // Push the hour itself
    hours.push({
      time: format(hour, 'hh:mm a'), // Format to 12-hour with AM/PM
      date: hour.toString(),
      slots: [], // Initialize slots array for each hour
    });

    // Generate slots per hour based on the interval
    for (let j = 0; j < 60 / interval; j++) {
      const slotHour = addMinutes(hour, j * interval); // Calculate the current slot hour
      hours[i].slots.push(format(slotHour, 'hh:mm a')); // Push formatted time slot (hh:mm a) to the slots array
    }
  }

  return hours;
};



// Get all days in the current month, including days from previous and next month to fill the calendar grid
export const getMonthViewDays = (currentDate) => {
  const start = startOfWeek(startOfMonth(currentDate));
  const end = endOfWeek(endOfMonth(currentDate));
  return eachDayOfInterval({ start, end });
};

// Get all hours in a day (you can modify this if you want specific hour ranges)
export const getDayHoursInMonth = (date) => {
  let hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(addDays(date, i));
  }
  return hours;
};



export const formatDate = (date, formatString = 'yyyy-MM-dd') => format(date, formatString);
export const parseDate = (dateString, formatString = 'yyyy-MM-dd') => parse(dateString, formatString, new Date());



function convertTimeToMinutes(time) {
  // Extract the period (AM/PM)
  const period = time.slice(-2);
  
  // Extract the hour and minute parts
  const [hourString, minuteString] = time.slice(0, -2).split(':');
  
  // Convert hour and minute parts to numbers
  let hours = parseInt(hourString, 10);
  const minutes = parseInt(minuteString, 10);
  
  // Convert hours to 24-hour format
  if (period === 'PM' && hours !== 12) {
      hours += 12;
  } else if (period === 'AM' && hours === 12) {
      hours = 0;
  }
  
  // Calculate total minutes
  return (hours * 60) + minutes;
}

// Example usage
const timeString = "9:00AM";
const totalMinutes = convertTimeToMinutes(timeString);
console.log(totalMinutes);  // Output: 540
