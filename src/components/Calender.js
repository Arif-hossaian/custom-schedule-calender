import React, { useState } from 'react';
import CalenderView from './CalenderView/CalenderView';
import WeekViewBody from './CalenderBody/WeekViewBody';
import WeekHeader from './CalenderHeader/WeekHeader';
import DayHeader from './CalenderHeader/DayHeader';
import DayViewBody from './CalenderBody/DayViewBody';
import MonthHeader from './CalenderHeader/MonthHeader';
import MonthViewBody from './CalenderBody/MonthViewBody';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthView, setMonthView] = useState(false)
  const [weekView, setWeekView] = useState(true)
  const [dayView, setDayView] = useState(false)
  const [agendaView, setAgendaView] = useState(false)
  //console.log('Calendar Component Rendered: currentDate', currentDate);


  return (
    <div className="flex flex-col max-w-screen px-10 mx-auto">
      <CalenderView setMonthView={setMonthView} monthView={monthView} weekView={weekView} setWeekView={setWeekView} dayView={dayView} setDayView={setDayView} agendaView={agendaView} setAgendaView={setAgendaView} />
      {monthView && (
        <>
        <MonthHeader currentDate={currentDate} setCurrentDate={setCurrentDate}/>
        <MonthViewBody currentDate={currentDate} />
        </>
      )}
      {weekView && (
        <>
          <WeekHeader currentDate={currentDate} setCurrentDate={setCurrentDate} />
          <WeekViewBody currentDate={currentDate} />

        </>
      )}
      {dayView && (
        <>
        <DayHeader currentDate={currentDate} setCurrentDate={setCurrentDate}/>
        <DayViewBody currentDate={currentDate} />
        </>
      )}
    </div>
  );
};

export default Calendar;
