import React from 'react';
import { format, addDays, subDays } from 'date-fns';

const DayHeader = ({ currentDate, setCurrentDate }) => {
  const goToPreviousDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToNextDay = () => setCurrentDate(addDays(currentDate, 1));

  return (
    <div className="flex justify-between p-4 bg-gray-200">
      <button onClick={goToPreviousDay} className="text-xl">&lt;</button>
      <div>{format(currentDate, 'EEEE MMM dd, yyyy')} <span className='font-mono ml-5 underline'>Daily</span></div>
      <button onClick={goToNextDay} className="text-xl">&gt;</button>
    </div>
  );
};

export default DayHeader;
