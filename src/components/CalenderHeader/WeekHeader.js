import React from 'react';
import { addMonths, subMonths } from 'date-fns';
import { formatDate } from '../../utils/dateUtlis'

const WeekHeader = ({ currentDate, setCurrentDate }) => {
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="flex justify-between p-4 bg-gray-200">
      <button onClick={goToPreviousMonth} className="text-xl">&lt;</button>
      <div>{formatDate(currentDate, 'MMMM yyyy')} <span className='font-mono ml-5 underline'>Weekly</span></div>
      <button onClick={goToNextMonth} className="text-xl">&gt;</button>
    </div>
  );
};

export default WeekHeader;