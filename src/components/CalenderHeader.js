import React from 'react';
import { addMonths, subMonths } from 'date-fns';
import { formatDate } from '../utils/dateUtlis'

const CalendarHeader = ({ currentDate, setCurrentDate }) => {
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="flex justify-between p-4 bg-gray-200">
      <button onClick={goToPreviousMonth} className="text-xl">&lt;</button>
      <div>{formatDate(currentDate, 'MMMM yyyy')}</div>
      <button onClick={goToNextMonth} className="text-xl">&gt;</button>
    </div>
  );
};

export default CalendarHeader;
