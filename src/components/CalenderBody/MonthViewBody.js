import React, { useState } from 'react';
import { getMonthViewDays } from '../../utils/dateUtlis';
import { format, isSameMonth, isSameDay, isWithinInterval, min, max, addDays } from 'date-fns';

const MonthViewBody = ({ currentDate }) => {
  const [events, setEvents] = useState([]);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [prompted, setPrompted] = useState(false); // New state to prevent double prompt
  const days = getMonthViewDays(currentDate);

  const handleCellClick = (day) => {
    if (!isSelecting && !prompted) {
      const title = prompt('Enter event title:');
      if (title) {
        const newEvent = { date: day, title };
        setEvents([...events, newEvent]);
      }
      setPrompted(true); // Set prompted to true
    }
  };

  const getEventsForDay = (day) => {
    return events.filter(event => format(event.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
  };

  const onDragStart = (event, eventDetails) => {
    event.dataTransfer.setData('eventDetails', JSON.stringify(eventDetails));
  };

  const onDrop = (event, targetDay) => {
    event.preventDefault(); // Prevent default behavior
    const eventDetails = JSON.parse(event.dataTransfer.getData('eventDetails'));
    const startRow = Math.floor(days.findIndex(day => isSameDay(day, eventDetails.date)) / 7);
    const targetRow = Math.floor(days.findIndex(day => isSameDay(day, targetDay)) / 7);

    // Allow only horizontal drag within the same row
    if (startRow === targetRow) {
      setEvents(events.map(ev =>
        ev === eventDetails ? { ...ev, date: targetDay } : ev
      ));
    }
  };

  const onDragOver = (event) => {
    event.preventDefault(); // Allow drop by preventing default
  };

  const onMouseDown = (day) => {
    setSelectionStart(day);
    setSelectionEnd(day);
    setIsSelecting(true);
    setPrompted(false); // Reset prompted state
  };

  const onMouseEnter = (day) => {
    if (isSelecting) {
      setSelectionEnd(day);
    }
  };

  const onMouseUp = () => {
    setIsSelecting(false);
    if (selectionStart && selectionEnd) {
      const startDate = min([selectionStart, selectionEnd]);
      const endDate = max([selectionStart, selectionEnd]);
      const title = prompt('Enter event title for the selected range:');
      if (title) {
        const newEvents = [];
        for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
          newEvents.push({ date, title });
        }
        setEvents([...events, ...newEvents]);
      }
    }
    setSelectionStart(null);
    setSelectionEnd(null);
    setPrompted(true); // Set prompted to true
  };

  const isDaySelected = (day) => {
    if (!selectionStart || !selectionEnd) {
      return false;
    }
    const startDate = min([selectionStart, selectionEnd]);
    const endDate = max([selectionStart, selectionEnd]);
    return isWithinInterval(day, { start: startDate, end: endDate });
  };

  return (
    <div className="border border-gray-300" onMouseUp={onMouseUp}>
      <div className="grid grid-cols-7 border-b border-gray-300">
        {days.slice(0, 7).map((day, index) => (
          <div key={index} className="p-2 text-center font-bold">
            {format(day, 'EEE')}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <div
            key={index}
            className={`py-10 border border-gray-300 text-center ${isSameMonth(day, currentDate) ? '' : 'bg-gray-200'} ${isDaySelected(day) ? 'bg-blue-100' : ''}`}
            onClick={() => handleCellClick(day)}
            onDrop={(event) => onDrop(event, day)}
            onDragOver={onDragOver}
            onMouseDown={() => onMouseDown(day)}
            onMouseEnter={() => onMouseEnter(day)}
          >
            {format(day, 'd')}
            <div className="mt-2">
              {getEventsForDay(day).map((eventDetails, eventIndex) => (
                <div
                  key={eventIndex}
                  className="bg-blue-200 p-1 mt-1 rounded cursor-pointer"
                  draggable
                  onDragStart={(event) => onDragStart(event, eventDetails)}
                >
                  {eventDetails.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthViewBody;
