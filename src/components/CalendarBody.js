import React, { useState } from 'react';
import { getWeekDays, formatDate, getDayHours } from '../utils/dateUtlis';


const CalendarBody = ({ currentDate }) => {
  const days = getWeekDays(currentDate);
  const dayHours = getDayHours(currentDate);
  const [slots, setSlots] = useState([]);

  const handleSlotClick = (dayIndex, hourIndex) => {
    const day = days[dayIndex];
    const hour = dayHours[hourIndex];
    const data = prompt('Enter data for this slot:');
    if (data !== null) {
      // If data is entered in the prompt, add the slot to the list
      setSlots([...slots, { day, hour, data }]);
    }
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
              return (
                <div
                  key={hourIndex}
                  className={`p-4 border border-gray-300 ${
                    slot ? 'bg-gray-200 py-1' : '' // Add background color if slot exists
                  }`}
                  onClick={() => handleSlotClick(dayIndex, hourIndex)}
                >
                  {/* Place for events or empty slots */}
                  {slot && <p>{slot.data}</p>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarBody;
