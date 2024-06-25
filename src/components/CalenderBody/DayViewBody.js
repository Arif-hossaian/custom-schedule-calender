import React, { useState, useEffect, useRef } from 'react';
import { getDayHours, parseDate } from '../../utils/dateUtlis';
import { v4 as uuid } from "uuid";
import { format } from 'date-fns';

const EventCard = ({ id, data, startTime, endTime, startTop, onDragStart }) => {
  const start = parseDate(startTime, 'HH:mm');
  const end = parseDate(endTime, 'HH:mm');
  const duration = (end.getTime() - start.getTime()) / (1000 * 60);
  const cardHeight = duration + 2;

  return (
    <div
      className="event-card border border-gray-900"
      style={{ height: `${cardHeight}px`, top: startTop, position: 'absolute', backgroundColor: 'lightblue', zIndex: 10, cursor: 'pointer', width: '100%' }}
      draggable
      onDragStart={(e) => onDragStart(e, id)}
    >
      <p>{data}</p>
      <p>{startTime} - {endTime}</p>
    </div>
  );
};

const DroppableSlot = ({ hourIndex, onDrop, children, isHoveredRow, selectedCells }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  console.log(selectedCells, 'selectedCells')


  const renderSelectedCells = () => {
    return selectedCells
      .filter(cell => cell.hourIndex === hourIndex)
      .map((cell, index) => (
        <div key={index} className="absolute w-full h-1/4" style={{ top: `${cell.slotIndex * 25}%`, backgroundColor: 'rgba(144, 238, 144, 0.5)' }}></div>
      ));
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => onDrop(e, hourIndex)}
      className={`border cell ${isHoveredRow ? 'hovered-row' : ''}`}
      style={{ position: 'relative' }}
    >
        {renderSelectedCells()}
      {children}
    </div>
  );
};

const DayViewBody = ({ currentDate }) => {
  const dayHours = getDayHours(currentDate);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [eventCards, setEventCards] = useState([]);
  const [selectedCellCount, setSelectedCellCount] = useState(0);
  const [currentTimePosition, setCurrentTimePosition] = useState(null);
  const isSelecting = useRef(false);

  useEffect(() => {
    const updateTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const slotHeight = 36; // Height of each slot
      const paddingHeight = 24; // Total vertical padding added by Tailwind's p-1.5

      const totalPixels = (totalMinutes / (24 * 60)) * (24 * (slotHeight + paddingHeight));
      setCurrentTimePosition(totalPixels);
    };

    updateTimePosition();
    const intervalId = setInterval(updateTimePosition, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSlotClick = (hourIndex, slotIndex) => {
    const text = prompt('Enter text for this slot:');
    if (text) {
      const startTime = format(new Date(currentDate).setHours(hourIndex, slotIndex * 15), 'HH:mm');
      const endTime = format(new Date(currentDate).setHours(hourIndex, slotIndex * 15 + 15), 'HH:mm');

      setEventCards((prev) => [
        ...prev,
        {
          id: uuid(),
          data: text,
          startTime,
          endTime,
          startTop: hourIndex * 24 + slotIndex * 6,
        },
      ]);
    }
  };

  const handleDragStart = (e, cardId) => {
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDrop = (e, hourIndex) => {
    const draggedCardId = e.dataTransfer.getData('text/plain');
    const draggedCardIndex = eventCards.findIndex(card => card.id === draggedCardId);

    const updatedEventCards = eventCards.map((card, index) => {
      if (index === draggedCardIndex) {
        return {
          ...card,
          startTop: hourIndex * 24,
        };
      }
      return card;
    });

    setEventCards(updatedEventCards);
  };

  const handleMouseDown = (hourIndex, slotIndex) => {
    isSelecting.current = true;
    const newSelectedCells = [{ hourIndex, slotIndex }];
    setSelectedCells(newSelectedCells);
    setSelectedCellCount(newSelectedCells.length);
  };

  const handleMouseEnter = (hourIndex, slotIndex) => {
    if (isSelecting.current) {
      setSelectedCells((prev) => {
        const newSelectedCells = [...prev, { hourIndex, slotIndex }];
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
            id: uuid(),
            data: text,
            startTime,
            endTime,
            startTop: startCell.hourIndex * 24 + startCell.slotIndex * 6,
          },
        ]);
      }
      setSelectedCells([]);
      setSelectedCellCount(0);
    }
  };

  const handleHover = (hourIndex) => {
    setHoveredCell({ hourIndex });
    setHoveredRow(hourIndex);
  };

  const handleLeave = () => {
    setHoveredCell(null);
    setHoveredRow(null);
  };

  const getTimeRange = (hour, index) => {
    const [hourPart, minutePart] = hour.time.split(':');
    const baseTime = new Date();
    let hourInt = parseInt(hourPart, 10);

    if (hourInt < 9) {
      hourInt += 12;
    }

    baseTime.setHours(hourInt, parseInt(minutePart, 10), 0, 0);

    const start = new Date(baseTime.getTime() + index * 15 * 60000);
    const end = new Date(baseTime.getTime() + (index + 1) * 15 * 60000);

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
      </div>

      <div className="grid grid-cols-8">
        <div className="time-labels">
          {dayHours.map((hour, hourIndex) => (
            <div
              key={hourIndex}
              className={`p-4 border border-gray-300 text-center time-cell ${hoveredRow === hourIndex ? 'hovered-row' : ''}`}
              onMouseEnter={() => handleHover(hourIndex)}
              onMouseLeave={handleLeave}
            >
              {hour.time}
            </div>
          ))}
        </div>
        <div className="time-slots col-span-7">
          <div className="w-full relative">
            {dayHours.map((hour, hourIndex) => {
              const isHoveredRow = hoveredCell && hoveredCell.hourIndex === hourIndex;

              return (
                <DroppableSlot
                  key={hourIndex}
                  hourIndex={hourIndex}
                  onLeave={handleLeave}
                  isHoveredRow={isHoveredRow}
                  selectedCells={selectedCells}
                  onDrop={handleDrop}
                >
                  <div className={`w-full h-full`}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-full text-sm p-1.5 border border-red-500 cursor-pointer hover:bg-yellow-100`}
                        onClick={() => handleSlotClick(hourIndex, index)}
                        onMouseDown={() => handleMouseDown(hourIndex, index)}
                        onMouseEnter={() => handleMouseEnter(hourIndex, index)}
                      >
                        {getTimeRange(hour, index)}
                      </div>
                    ))}
                  </div>
                </DroppableSlot>
              );
            })}

            {eventCards.map((card) => (
              <EventCard
                key={card.id}
                id={card.id}
                data={card.data}
                startTime={card.startTime}
                endTime={card.endTime}
                startTop={card.startTop}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>

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

export default DayViewBody;
