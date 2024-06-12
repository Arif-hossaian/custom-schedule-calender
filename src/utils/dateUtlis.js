import { startOfWeek, addDays, addHours, format, parse } from 'date-fns';

export const getWeekDays = (date) => {
  let start = startOfWeek(date);
  let days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
};

export const getDayHours = (date) => {
  let start = new Date(date.setHours(9, 0, 0, 0)); // Start from 9:00 AM
  let hours = [];
  for (let i = 0; i < 8; i++) { // Generate hours from 9:00 AM to 4:00 PM
    let hour = addHours(start, i);
    hours.push({
      time: format(hour, 'HH:mm'),
      date: hour.toString(),
    });
  }
  return hours;
};

export const formatDate = (date, formatString = 'yyyy-MM-dd') => format(date, formatString);
export const parseDate = (dateString, formatString = 'yyyy-MM-dd') => parse(dateString, formatString, new Date());
