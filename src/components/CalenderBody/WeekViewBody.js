import React, { useState, useEffect, useRef } from 'react';
import { getWeekDays, formatDate, getDayHours, parseDate } from '../../utils/dateUtlis';
import { v4 as uuid } from "uuid";
import { format } from 'date-fns'; // Import format from date-fns

const EventCard = ({ data, startTime, endTime, startTop, height }) => {
  return (
    <div style={{ height: `${height}px`, top: startTop, position: 'absolute', backgroundColor: 'lightblue', zIndex: 10, cursor: 'pointer', width: '100%' }}>
      <div className='flex justify-start items-center'>
        <p>{data}</p>
        <p className='ml-2'>{startTime} - {endTime}</p>
      </div>
    </div>
  );
};

const DroppableSlot = ({
  dayIndex,
  hourIndex,
  slotIndex,
  onDrop,
  onHover,
  onLeave,
  children,
  isHoveredRow,
  isHoveredColumn,
  isHoveredTimeSlot,
  isSelected,
  isSelecting,
  selectedCells,
  calculateHeightOfSlot,
  hour
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const renderSelectedCells = () => {
    return selectedCells
      .filter(cell => cell.dayIndex === dayIndex && cell.hourIndex === hourIndex)
      .map((cell, index) => (
        <div key={index} className={`absolute w-full h-[30px]`} style={{ top: `${cell.slotIndex * 25}%`, backgroundColor: 'rgba(144, 238, 144, 0.5)', }}></div>
      ));
  };

  return (
    <div
      onDrop={(e) => onDrop(e, dayIndex, hourIndex)}
      onDragOver={handleDragOver}
      onMouseEnter={() => onHover(dayIndex, hourIndex, slotIndex)}
      onMouseLeave={onLeave}
      className={`border h-[120px] ${isHoveredRow ? 'hovered-row' : ''} ${isHoveredColumn ? 'hovered-column' : ''} ${isHoveredTimeSlot ? 'hovered-time-slot' : ''}`}
      style={{ position: 'relative' }}
    >
      {renderSelectedCells()}
      {children}
    </div>
  );
};

const WeekViewBody = ({ currentDate }) => {
  const interval = 15
  const days = getWeekDays(currentDate);
  const dayHours = getDayHours(currentDate, interval);
  const [slots, setSlots] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [eventCards, setEventCards] = useState([]);
  const [selectedCellCount, setSelectedCellCount] = useState(0);
  const [currentTimePosition, setCurrentTimePosition] = useState(null);
  const isSelecting = useRef(false);

  const unique_id = uuid();
  const currentTime = format(currentDate, 'hh:mm a');

  useEffect(() => {
    const updateTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const slotHeight = 13; // Height of each slot
      const paddingHeight = 24; // Total vertical padding added by Tailwind's p-1.5

      const totalPixels = (totalMinutes / (24 * 60)) * (24 * (slotHeight + paddingHeight));

      setCurrentTimePosition(totalPixels);
    };

    updateTimePosition();
    const intervalId = setInterval(updateTimePosition, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSlotClick = (dayIndex, hourIndex, slotIndex) => {
    const text = prompt('Enter text for this slot:');
    if (text !== null) {
      let newSlots = slots.slice();
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

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDrop = (e, dayIndex, hourIndex) => {
    const draggedCardId = e.dataTransfer.getData('text/plain');
    const draggedCardIndex = eventCards.findIndex(card => card.id === draggedCardId);

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

    setEventCards(updatedEventCards);
  };

  const handleMouseDown = (dayIndex, hourIndex, slotIndex) => {
    isSelecting.current = true;
    const newSelectedCells = [{ dayIndex, hourIndex, slotIndex }];
    setSelectedCells(newSelectedCells);
    setSelectedCellCount(newSelectedCells.length);
  };

  const handleMouseEnter = (dayIndex, hourIndex, slotIndex) => {
    if (isSelecting.current) {
      setSelectedCells((prev) => {
        const newSelectedCells = [...prev, { dayIndex, hourIndex, slotIndex }];
        setSelectedCellCount(newSelectedCells.length);
        return newSelectedCells;
      });
    }
  };

  const handleMouseUp = () => {
    isSelecting.current = false;
    if (selectedCells.length > 0) {
      const startCell = selectedCells[0];
      const endCell = selectedCells[selectedCells.length - 1];
      const startHour = dayHours[startCell.hourIndex].time;

      const baseTime = new Date();
      let hourInt = parseInt(startHour.split(':')[0], 10);

      if (hourInt < 9) {
        hourInt += 12; 
      }

      baseTime.setHours(hourInt, parseInt(startHour.split(':')[1], 10), 0, 0);

      const startDateTime = new Date(baseTime.getTime() + startCell.slotIndex * interval * 60000);
      const startTime = format(startDateTime, 'hh:mm a');

      const endDateTime = new Date(baseTime.getTime() + (endCell.hourIndex - startCell.hourIndex) * 60 * 60000 + (endCell.slotIndex + 1) * interval * 60000);
      const endTime = format(endDateTime, 'hh:mm a');

      const durationInMinutes = (endDateTime.getTime() - startDateTime.getTime()) / 60000;
      const height = (durationInMinutes / 60) * 120; // Adjust this to fit your slot height

      const text = prompt('Enter text for this event:');
      if (text) {
        setEventCards((prev) => [
          ...prev,
          {
            id: unique_id.slice(0, 8),
            data: text,
            startTime,
            endTime,
            dayIndex: startCell.dayIndex,
            startTop: startCell.hourIndex * 120 + startCell.slotIndex * (120 / (60 / interval)),
            height
          },
        ]);
      }
      setSelectedCells([]);
      setSelectedCellCount(0);
    }
  };

  const handleHover = (dayIndex, hourIndex, slotIndex) => {
    setHoveredCell({ dayIndex, hourIndex });
    setHoveredColumn(dayIndex);
    setHoveredRow(hourIndex);
    setHoveredTimeSlot({ hourIndex, slotIndex });
  };

  const handleLeave = () => {
    setHoveredCell(null);
    setHoveredColumn(null);
    setHoveredRow(null);
    setHoveredTimeSlot(null);
  };

  const calculateHeightOfSlot = (slotLength) => {
    const cellHeight = 120; // Height of the parent div in pixels

    let totalPadding = (slotLength - 1) * 2; // Assuming 2px of padding on both top and bottom

    let paddingY = (cellHeight - totalPadding) / slotLength;
    return paddingY;
  };

  return (
    <div className="border border-gray-300" onMouseUp={handleMouseUp}>
      <div className="grid grid-cols-8">
        <div className="p-4 border border-gray-300 text-center">
          {/* Selected Slots: {selectedCellCount} */}
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
              onMouseEnter={() => handleHover(null, hourIndex, hour.slots)}
              onMouseLeave={handleLeave}
            >
              {hour.time}
            </div>
          ))}
        </div>

        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="relative">
            {dayHours.map((hour, hourIndex) => {
              const isHoveredRow = hoveredCell && hoveredCell.hourIndex === hourIndex;
              const isHoveredColumn = hoveredCell && hoveredCell.dayIndex === dayIndex;
              const isHoveredTimeSlot = hoveredTimeSlot && hoveredTimeSlot.hourIndex === hourIndex && hoveredTimeSlot.slotIndex === 0;

              return (
                <DroppableSlot
                  key={hourIndex}
                  dayIndex={dayIndex}
                  hourIndex={hourIndex}
                  slotIndex={0}
                  hour={hour}
                  calculateHeightOfSlot={calculateHeightOfSlot}
                  onDrop={(e) => handleDrop(e, dayIndex, hourIndex)}
                  onHover={() => handleHover(dayIndex, hourIndex, 1)}
                  onLeave={handleLeave}
                  isHoveredRow={isHoveredRow}
                  isHoveredColumn={isHoveredColumn}
                  isHoveredTimeSlot={isHoveredTimeSlot}
                  selectedCells={selectedCells}
                >
                  <div className={`w-full`}>
                    {hour.slots.map((_, index) => {
                      const isHoveredSlot = hoveredTimeSlot && hoveredTimeSlot.hourIndex === hourIndex && hoveredTimeSlot.slotIndex === index;
                      return (
                        <div
                          key={index}
                          className={`w-full text-sm border border-gray-800 cursor-pointer ${isHoveredSlot ? 'bg-blue-100' : ''}`}
                          style={{ paddingTop: calculateHeightOfSlot(hour.slots.length) }}
                          onClick={() => handleSlotClick(dayIndex, hourIndex, index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, dayIndex, hourIndex)}
                          onMouseDown={() => handleMouseDown(dayIndex, hourIndex, index)}
                          onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex, index)}
                        >
                          {/* {getTimeRange(hour, index)} */}
                        </div>
                      );
                    })}
                  </div>
                </DroppableSlot>
              );
            })}
            {eventCards
              .filter((card) => card.dayIndex === dayIndex)
              .map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id)}
                >
                  <EventCard
                    data={card.data}
                    startTime={card.startTime}
                    endTime={card.endTime}
                    startTop={card.startTop}
                    height={card.height}
                  />
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};
export default WeekViewBody;
