import React, { useState } from 'react';
import CalendarHeader from './CalenderHeader';
import CalendarBody from './CalendarBody';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  //console.log('Calendar Component Rendered: currentDate', currentDate);


  return (
    <div className="flex flex-col max-w-screen px-10 mx-auto">
      <CalendarHeader currentDate={currentDate} setCurrentDate={setCurrentDate} />
      <CalendarBody currentDate={currentDate} />
    </div>
  );
};

export default Calendar;
