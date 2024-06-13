import React, { useState } from 'react';
import { getWeekDays, formatDate, getDayHours } from '../utils/dateUtlis';

const DraggableSlot = ({ slot, index, onDragStart }) => {
  //console.log(slot, 'slot')
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      className="p-4 border border-gray-300 bg-gray-200 py-1"
    >
      <p>{slot.data}</p>
    </div>
  );
};

const DroppableSlot = ({ dayIndex, hourIndex, onDrop, children }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={(e) => onDrop(e, dayIndex, hourIndex)}
      onDragOver={handleDragOver}
      className="p-4 border border-gray-300"
    >
      {children}
    </div>
  );
};

const CalendarBody = ({ currentDate }) => {
  const days = getWeekDays(currentDate);
  const dayHours = getDayHours(currentDate);
  const [slots, setSlots] = useState([]);

  const handleSlotClick = (dayIndex, hourIndex) => {
    const day = days[dayIndex];
    const hour = dayHours[hourIndex];
    const data = prompt('Enter data for this slot:');
    if (data !== null) {
      setSlots([...slots, { day, hour, data }]);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, dayIndex, hourIndex) => {
    const index = e.dataTransfer.getData('text/plain');
    const newSlots = slots.map((slot, i) =>
      i === parseInt(index, 10)
        ? { ...slot, day: days[dayIndex], hour: dayHours[hourIndex] }
        : slot
    );
    setSlots(newSlots);
  };

  return (
    <div className='border border-gray-300'>
      {/* Header Row */}
      <div className="grid grid-cols-8">
        <div className="p-4 border border-gray-300 text-center"></div> {/* Empty box for time labels */}
        {days.map((day, index) => (
          <div key={index} className="p-4 border border-gray-300 text-center">
            {formatDate(day, 'dd')}
          </div>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-8">
        {/* Time Labels Column */}
        <div className="grid grid-rows-24">
          {dayHours.map((hour, index) => (
            <div key={index} className='p-4 border border-gray-300 text-center'>
              {hour.time}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className='grid grid-rows-24'>
            {dayHours.map((hour, hourIndex) => {
              const slot = slots.find(
                slot =>
                  slot.day.getTime() === day.getTime() &&
                  slot.hour.time === hour.time
              );
              console.log(slot, 'slot')
              return (
                <DroppableSlot
                  key={hourIndex}
                  dayIndex={dayIndex}
                  hourIndex={hourIndex}
                  onDrop={handleDrop}
                >
                  {slot ? (
                    <DraggableSlot
                      slot={slot}
                      index={slots.indexOf(slot)}
                      onDragStart={handleDragStart}
                    />
                  ) : (
                    <div
                      className="p-4 border border-gray-300"
                      onClick={() => handleSlotClick(dayIndex, hourIndex)}
                    >
                      {/* Empty Slot */}
                    </div>
                  )}
                </DroppableSlot>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarBody;
