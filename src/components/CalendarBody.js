import React, { useState, useEffect, useRef } from 'react';
import { getWeekDays, formatDate, getDayHours, parseDate } from '../utils/dateUtlis';
import { v4 as uuid } from "uuid";
import { format } from 'date-fns'; // Import format from date-fns


const EventCard = ({ data, startTime, endTime, startTop }) => {
  const start = parseDate(startTime, 'HH:mm');
  const end = parseDate(endTime, 'HH:mm');
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
  const cardHeight = duration + 2;

  return (
    <div className="event-card" style={{ height: `120px`, top: startTop, position: 'absolute', backgroundColor: 'lightblue', zIndex: 10, cursor:'pointer', width:'100%' }}>
      <p>{data}</p>
      <p>{startTime} - {endTime}</p>
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
  isSelected,
  isSelecting,
  selectedCells,
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const renderSelectedCells = () => {
    return selectedCells
      .filter(cell => cell.dayIndex === dayIndex && cell.hourIndex === hourIndex)
      .map((cell, index) => (
        <div key={index} className="absolute w-full h-1/4" style={{ top: `${cell.slotIndex * 25}%`, backgroundColor: 'rgba(144, 238, 144, 0.5)' }}></div>
      ));
  };

  return (
    <div
      onDrop={(e) => onDrop(e, dayIndex, hourIndex)}
      onDragOver={handleDragOver}
      onMouseEnter={() => onHover(dayIndex, hourIndex)}
      onMouseLeave={onLeave}
      className={`border cell ${isHoveredRow ? 'hovered-row' : ''} ${isHoveredColumn ? 'hovered-column' : ''}`}
      style={{ position: 'relative' }}
    >
      {renderSelectedCells()}
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
  const [selectedCellCount, setSelectedCellCount] = useState(0);
  const [currentTimePosition, setCurrentTimePosition] = useState(null);
  const isSelecting = useRef(false);

  const unique_id = uuid();

  useEffect(() => {
    const updateTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      
      // Assuming each slot has a height of 140px and considering Tailwind padding (p-1.5 adds 24px vertically)
      const slotHeight = 26.8; // Height of each slot
      const paddingHeight = 24; // Total vertical padding added by Tailwind's p-1.5
      
      // Calculate total pixels considering the slot height and padding
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
    
      const startDateTime = new Date(baseTime.getTime() + startCell.slotIndex * 15 * 60000);
      const startTime = format(startDateTime, 'hh:mm a');
      
      const endDateTime = new Date(baseTime.getTime() + (endCell.hourIndex - startCell.hourIndex) * 60 * 60000 + (endCell.slotIndex + 1) * 15 * 60000);
      const endTime = format(endDateTime, 'hh:mm a');

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
            startTop: startCell.hourIndex * 24 + startCell.slotIndex * 6,
          },
        ]);
      }
      setSelectedCells([]);
      setSelectedCellCount(0);
    }
  };

  const handleHover = (dayIndex, hourIndex, slots) => {
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
    // Split hour.time to get hour and minute parts
    const [hourPart, minutePart] = hour.time.split(':');
    
    // Create a new Date object and set its hours and minutes
    const baseTime = new Date();
    let hourInt = parseInt(hourPart, 10);
  
    // Adjust for PM hours (assuming hour.time is in 24-hour format)
    if (hourInt < 9) {
      hourInt += 12; // Convert morning hours (1 PM to 11 PM)
    }
  
    baseTime.setHours(hourInt, parseInt(minutePart, 10), 0, 0);
    
    // Calculate start and end times based on 15-minute intervals
    const start = new Date(baseTime.getTime() + index * 15 * 60000);
    const end = new Date(baseTime.getTime() + (index + 1) * 15 * 60000);
  
    // Format start and end times to 'hh:mm a'
    const startFormatted = format(start, 'hh:mm a');
    const endFormatted = format(end, 'hh:mm a');
    
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <div className="border border-gray-300" onMouseUp={handleMouseUp}>
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
              const slotsForHour = slots.filter(
                (slot) => slot.dayIndex === dayIndex && slot.hourIndex === hourIndex
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
                  onHover={() => handleHover(dayIndex, hourIndex, hour.slots)}
                  onLeave={handleLeave}
                  isHoveredRow={isHoveredRow}
                  isHoveredColumn={isHoveredColumn}
                  isSelected={isSelected}
                  isSelecting={isSelecting.current && isSelected}
                  selectedCells={selectedCells}
                >
                  <div className={`w-full h-full`}>
                    {Array.from({ length: 4 }).map((_, index) => {
                      const slot = slotsForHour.find((s) => s.slotIndex === index);
                      return (
                        <div
                          key={index}
                          className={`w-full text-sm p-1.5 border border-red-500 cursor-pointer hover:bg-yellow-100`}
                          onClick={() => handleSlotClick(dayIndex, hourIndex, index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, dayIndex, hourIndex)}
                          onMouseDown={() => handleMouseDown(dayIndex, hourIndex, index)}
                          onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex, index)}
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
              .map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id)}
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

        {currentTimePosition !== null && (
          <div
            style={{
              position: 'absolute',
              top: `${currentTimePosition}px`,
              left: '0',
              right: '0',
              height: '2px',
              backgroundColor: 'yellow',
              zIndex: 20,
            }}
          />
        )}
      </div>
    </div>
  );
};
export default CalendarBody;


