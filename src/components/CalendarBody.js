import React, { useState } from 'react';
import { getWeekDays, formatDate, getDayHours } from '../utils/dateUtlis';

const DraggableSlot = ({ slot, index, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      className="p-4   py-1"
    >
      <p>{slot.data}</p>
    </div>
  );
};

const DroppableSlot = ({ dayIndex, hourIndex, onDrop, onHover, onLeave, children }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={(e) => onDrop(e, dayIndex, hourIndex)}
      onDragOver={handleDragOver}
      onMouseEnter={() => onHover(dayIndex, hourIndex)}
      onMouseLeave={onLeave}
      className="p-4 border  cell"
    >
      {children}
    </div>
  );
};

const CalendarBody = ({ currentDate }) => {
  const days = getWeekDays(currentDate);
  const dayHours = getDayHours(currentDate);
  const [slots, setSlots] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);

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
    const draggedSlotIndex = e.dataTransfer.getData('text/plain');
    const draggedSlot = slots[draggedSlotIndex];

    const targetSlotIndex = slots.findIndex(
      slot =>
        slot.day.getTime() === days[dayIndex].getTime() &&
        slot.hour.time === dayHours[hourIndex].time
    );

    // Swap the slots if the target slot exists
    if (targetSlotIndex !== -1) {
      const newSlots = [...slots];
      const temp = newSlots[draggedSlotIndex];
      newSlots[draggedSlotIndex] = newSlots[targetSlotIndex];
      newSlots[targetSlotIndex] = temp;
      setSlots(newSlots);
    } else {
      // Move the dragged slot to the new empty position
      const newSlots = slots.map((slot, i) =>
        i === parseInt(draggedSlotIndex, 10)
          ? { ...slot, day: days[dayIndex], hour: dayHours[hourIndex] }
          : slot
      );
      setSlots(newSlots);
    }
  };

  const handleHover = (dayIndex, hourIndex) => {
    setHoveredCell({ dayIndex, hourIndex });
  };

  const handleLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className='border border-gray-300'>
      {/* Header Row */}
      <div className="grid grid-cols-8">
        <div className="p-4 border border-gray-300 text-center"></div> {/* Empty box for time labels */}
        {days.map((day, index) => (
          <div key={index} className="p-4 border border-gray-300 text-center header-cell">
            {formatDate(day, 'dd')}
          </div>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-8">
        {/* Time Labels Column */}
        <div className="grid grid-rows-24">
          {dayHours.map((hour, index) => (
            <div key={index} className='p-4 border border-gray-300 text-center time-cell'>
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
              const isHoveredRow = hoveredCell && hoveredCell.hourIndex === hourIndex;
              const isHoveredColumn = hoveredCell && hoveredCell.dayIndex === dayIndex;

              return (
                <DroppableSlot
                  key={hourIndex}
                  dayIndex={dayIndex}
                  hourIndex={hourIndex}
                  onDrop={handleDrop}
                  onHover={handleHover}
                  onLeave={handleLeave}
                >
                  <div className={` ${isHoveredRow ? 'hovered-row' : ''} ${isHoveredColumn ? 'hovered-column' : ''}`}>
                    {slot ? (
                      <DraggableSlot
                        slot={slot}
                        index={slots.indexOf(slot)}
                        onDragStart={handleDragStart}
                      />
                    ) : (
                      <div
                        className="p-4 "
                        onClick={() => handleSlotClick(dayIndex, hourIndex)}
                      >
                        {/* Empty Slot */}
                      </div>
                    )}
                  </div>
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
