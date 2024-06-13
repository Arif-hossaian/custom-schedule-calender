import React, { useState, useRef } from 'react';
import { getWeekDays, formatDate, getDayHours } from '../utils/dateUtlis';

const DraggableSlot = ({ slot, index, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      className="py-1"
    >
      <p>{slot.data}</p>
    </div>
  );
};

const DroppableSlot = ({
  dayIndex,
  hourIndex,
  onDrop,
  onHover,
  onLeave,
  children,
  isHoveredRow,
  isHoveredColumn,
  isSelected
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={(e) => onDrop(e, dayIndex, hourIndex)}
      onDragOver={handleDragOver}
      onMouseEnter={() => onHover(dayIndex, hourIndex)}
      onMouseLeave={onLeave}
      className={`border cell ${isHoveredRow ? 'hovered-row' : ''} ${isHoveredColumn ? 'hovered-column' : ''}`}
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
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const isSelecting = useRef(false);

  const handleSlotClick = () => {
    const data = prompt('Enter data for this slot:');
    if (data !== null) {
      const newSlots = slots.slice();
      selectedCells.forEach(({ dayIndex, hourIndex }) => {
        const day = days[dayIndex];
        const hour = dayHours[hourIndex];
        const existingSlotIndex = newSlots.findIndex(
          (slot) =>
            slot.day.getTime() === day.getTime() &&
            slot.hour.time === hour.time
        );

        if (existingSlotIndex > -1) {
          newSlots[existingSlotIndex] = { ...newSlots[existingSlotIndex], data };
        } else {
          newSlots.push({ day, hour, data });
        }
      });
      setSlots(newSlots);
      setSelectedCells([]);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, dayIndex, hourIndex) => {
    const draggedSlotIndex = e.dataTransfer.getData('text/plain');
    const draggedSlot = slots[draggedSlotIndex];

    const targetSlotIndex = slots.findIndex(
      (slot) =>
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

  const handleMouseDown = (dayIndex, hourIndex) => {
    isSelecting.current = true;
    setSelectedCells([{ dayIndex, hourIndex }]);
  };

  const handleMouseEnter = (dayIndex, hourIndex) => {
    if (isSelecting.current) {
      setSelectedCells((prev) => {
        if (!prev.find((cell) => cell.dayIndex === dayIndex && cell.hourIndex === hourIndex)) {
          return [...prev, { dayIndex, hourIndex }];
        }
        return prev;
      });
    }
  };

  const handleMouseUp = () => {
    isSelecting.current = false;
    if (selectedCells.length > 0) {
      handleSlotClick();
    }
  };

  const handleHover = (dayIndex, hourIndex) => {
    setHoveredCell({ dayIndex, hourIndex });
    setHoveredColumn(dayIndex);
    setHoveredRow(hourIndex);
  };

  const handleLeave = () => {
    setHoveredCell(null);
    setHoveredColumn(null);
    setHoveredRow(null);
  };

  return (
    <div className='border border-gray-300' onMouseUp={handleMouseUp}>
      {/* Header Row */}
      <div className="grid grid-cols-8">
        <div className="p-4 border border-gray-300 text-center"></div> {/* Empty box for time labels */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`p-4 border border-gray-300 text-center header-cell ${hoveredColumn === index ? 'hovered-header-column' : ''}`}
            onMouseEnter={() => handleHover(index)}
            onMouseLeave={handleLeave}
          >
            {formatDate(day, 'dd')}
          </div>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-8">
        {/* Time Labels Column */}
        <div className="grid grid-rows-24">
          {dayHours.map((hour, hourIndex) => (
            <div
              key={hourIndex}
              className={`p-4 border border-gray-300 text-center time-cell ${hoveredRow === hourIndex ? 'hovered-row' : ''}`}
              onMouseEnter={() => handleHover(null, hourIndex)}
              onMouseLeave={handleLeave}
            >
              {hour.time}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className='grid grid-rows-24'>
            {dayHours.map((hour, hourIndex) => {
              const slot = slots.find(
                (slot) =>
                  slot.day.getTime() === day.getTime() &&
                  slot.hour.time === hour.time
              );
              const isHoveredRow = hoveredCell && hoveredCell.hourIndex === hourIndex;
              const isHoveredColumn = hoveredCell && hoveredCell.dayIndex === dayIndex;
              const isSelected = selectedCells.some(
                (cell) => cell.dayIndex === dayIndex && cell.hourIndex === hourIndex
              );

              return (
                <DroppableSlot
                  key={hourIndex}
                  dayIndex={dayIndex}
                  hourIndex={hourIndex}
                  onDrop={handleDrop}
                  onHover={() => handleHover(dayIndex, hourIndex)}
                  onLeave={handleLeave}
                  isHoveredRow={isHoveredRow}
                  isHoveredColumn={isHoveredColumn}
                  isSelected={isSelected}
                >
                  <div
                    className="p-10"
                    onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
                    onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex)}
                  >
                    {slot ? (
                      <DraggableSlot
                        slot={slot}
                        index={slots.indexOf(slot)}
                        onDragStart={handleDragStart}
                      />
                    ) : (
                      <div>{/* Empty Slot */}</div>
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
