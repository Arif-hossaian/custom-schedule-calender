import React from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { getWeekDays } from '../../utils/dateUtlis'

const WeekHeader = ({ currentDate, setCurrentDate }) => {
  const days = getWeekDays(currentDate);
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));


  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  // Format the dates
  const formattedFirstDay = format(firstDay, 'MMMM d');
  const formattedLastDay = format(lastDay, 'MMMM d');

  return (
    <div className="flex justify-between p-4 bg-gray-200">
      <button onClick={goToPreviousMonth} className="text-xl">&lt;</button>
      <div className='flex jsutify-center items-center'>
        <p>{formattedFirstDay} - {formattedLastDay}</p>
        <p className='font-mono ml-5 underline'>Weekly</p>
      </div>
      <button onClick={goToNextMonth} className="text-xl">&gt;</button>
    </div>
  );
};

export default WeekHeader;
