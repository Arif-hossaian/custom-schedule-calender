import React from 'react';
import { addMonths, subMonths, format } from 'date-fns';

const MonthHeader = ({ currentDate, setCurrentDate }) => {
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));


  return (
    <div className="flex justify-between p-4 bg-gray-200">
      <button onClick={goToPreviousMonth} className="text-xl">&lt;</button>
      <div className='flex jsutify-center items-center'>
        <p>{format(currentDate, 'MMM yyyy')}</p>
        <p className='font-mono ml-5 underline'>Month</p>
      </div>
      <button onClick={goToNextMonth} className="text-xl">&gt;</button>
    </div>
  );
};

export default MonthHeader;
