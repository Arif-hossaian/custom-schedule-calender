import React, { useState, useRef } from 'react';
import { getWeekDays, formatDate, getDayHours, parseDate } from '../utils/dateUtlis';

const EventCard = ({ data, startTime, endTime, startTop }) => {
  const start = parseDate(startTime, 'HH:mm');
  const end = parseDate(endTime, 'HH:mm');

  const duration = (end.getTime() - start.getTime()) / (1000 * 60);

  const cardHeight = duration + 2;

  return (
    <div className="event-card" style={{ height: `120px`, top: startTop, position: 'absolute', backgroundColor: 'lightblue', zIndex: 10 }}>
      <p>{data}</p>
      <p>{startTime} - {endTime}</p>
    </div>
  );
};

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
      className={`border cell ${isHoveredRow ? 'hovered-row' : ''} ${isHoveredColumn ? 'hovered-column' : ''} ${isSelected ? 'selected' : ''}`}
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
  const [eventCards, setEventCards] = useState([]);
  const [selectedCellCount, setSelectedCellCount] = useState(0); // New state for the counter
  const [slotCounts, setSlotCounts] = useState({});

  const isSelecting = useRef(false);

  const handleSlotClick = (dayIndex, hourIndex, slotIndex) => {
    const text = prompt('Enter text for this slot:');

    if (text !== null) {
      const newSlots = slots.slice();
      const existingSlotIndex = newSlots.findIndex(
        (slot) =>
          slot.dayIndex === dayIndex &&
          slot.hourIndex === hourIndex &&
          slot.slotIndex === slotIndex
      );

      if (existingSlotIndex > -1) {
        newSlots[existingSlotIndex] = { ...newSlots[existingSlotIndex], text };
      } else {
        newSlots.push({ dayIndex, hourIndex, slotIndex, text });
      }

      setSlots(newSlots);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e, dayIndex, hourIndex) => {
    const draggedCardIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    const draggedCard = eventCards[draggedCardIndex];

    const updatedEventCards = eventCards.map((card, index) => {
      if (index === draggedCardIndex) {
        return {
          ...card,
          dayIndex,
          startTop: hourIndex * 24,
        };
      }
      return card;
    });

    const newSlots = slots.map((slot) => {
      if (
        slot.dayIndex === draggedCard.dayIndex &&
        slot.hourIndex === Math.floor(draggedCard.startTop / 24)
      ) {
        return {
          ...slot,
          dayIndex,
          hourIndex,
        };
      }
      return slot;
    });

    setEventCards(updatedEventCards);
    setSlots(newSlots);
  };

  const handleMouseDown = (dayIndex, hourIndex) => {
    isSelecting.current = true;
    const newSelectedCells = [{ dayIndex, hourIndex }];
    setSelectedCells(newSelectedCells);
    setSelectedCellCount(newSelectedCells.length); // Update the counter
  };

  const handleMouseEnter = (dayIndex, hourIndex) => {
    if (isSelecting.current) {
      setSelectedCells((prev) => {
        const newSelectedCells = [...prev, { dayIndex, hourIndex }];
        setSelectedCellCount(newSelectedCells.length); // Update the counter
        return newSelectedCells;
      });
    }
  };

  const handleMouseUp = () => {
    isSelecting.current = false;
    if (selectedCells.length > 0) {
      const startCell = selectedCells[0];
      const endCell = selectedCells[selectedCells.length - 1];
      const startTime = dayHours[startCell.hourIndex].time;
      const endTime = new Date(new Date(`1970-01-01T${dayHours[endCell.hourIndex].time}Z`).getTime() + 15 * 60000).toISOString().substr(11, 5);
      const text = prompt('Enter text for this event:');

      if (text) {
        setEventCards((prev) => [
          ...prev,
          {
            data: text,
            startTime,
            endTime,
            dayIndex: startCell.dayIndex,
            startTop: startCell.hourIndex * 24,
          },
        ]);
      }
      setSelectedCells([]);
      setSelectedCellCount(0); // Reset the counter
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

  const getTimeRange = (hour, index) => {
    const baseTime = new Date(`1970-01-01T${hour.time}Z`);
    const start = new Date(baseTime.getTime() + index * 15 * 60000).toISOString().substr(11, 5);
    const end = new Date(baseTime.getTime() + (index + 1) * 15 * 60000).toISOString().substr(11, 5);
    return `${start} - ${end}`;
  };

  return (
    <div className='border border-gray-300' onMouseUp={handleMouseUp}>
      <div className="grid grid-cols-8">
        <div className="p-4 border border-gray-300 text-center">
          Selected Slots: {selectedCellCount}
        </div>
        {days.map((day, index) => (
          <div
            key={index}
            className={`p-4 border border-gray-300 text-center ${hoveredColumn === index ? 'hovered-header-column' : ''}`}
            onMouseEnter={() => handleHover(index)}
            onMouseLeave={handleLeave}
          >
            {formatDate(day, 'dd')}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8">
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

        {days.map((day, dayIndex) => (
          <div key={dayIndex} className='grid grid-rows-24 relative'>
            {dayHours.map((hour, hourIndex) => {
              const slotsForHour = slots.filter(
                (slot) =>
                  slot.dayIndex === dayIndex &&
                  slot.hourIndex === hourIndex
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
                  onDrop={(e) => handleDrop(e, dayIndex, hourIndex)}
                  onHover={() => handleHover(dayIndex, hourIndex)}
                  onLeave={handleLeave}
                  isHoveredRow={isHoveredRow}
                  isHoveredColumn={isHoveredColumn}
                  isSelected={isSelected}
                >
                  <div
                    className="w-full h-full"
                  >
                    {Array.from({ length: 4 }).map((_, index) => {
                      const slot = slotsForHour.find((s) => s.slotIndex === index);
                      return (
                        <div
                          key={index}
                          className="w-full p-1 border border-red-500"
                          onClick={() => handleSlotClick(dayIndex, hourIndex, index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, dayIndex, hourIndex)}
                          onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
                          onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex)}
                        >
                          {getTimeRange(hour, index)} {slot ? slot.text : ''}
                        </div>
                      );
                    })}
                  </div>
                </DroppableSlot>
              );
            })}

            {eventCards
              .filter((card) => card.dayIndex === dayIndex)
              .map((card, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  style={{
                    top: `${card.startTop}px`,
                    position: 'absolute',
                    zIndex: 10,
                    backgroundColor: 'lightblue',
                    width: '100%',
                    transform: `translateY(${card.startTop}px)`,
                  }}
                >
                  <EventCard
                    data={card.data}
                    startTime={card.startTime}
                    endTime={card.endTime}
                    startTop={card.startTop}
                  />
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarBody;
