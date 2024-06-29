import React, { useState, useEffect, useRef } from 'react';
import { getWeekDays, formatDate, getDayHours, parseDate } from '../../utils/dateUtlis';
import { v4 as uuid } from "uuid";
import { format, parseISO, differenceInMinutes } from 'date-fns'; // Import necessary functions from date-fns

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
  const interval = 15;
  const days = getWeekDays(currentDate);
  let weekHours = {};

  days.forEach(day => {
    weekHours[format(day, 'yyyy-MM-dd')] = getDayHours(day, interval);
  });

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

  useEffect(() => {
    // Fetch the API data and update the event cards
    const fetchData = async () => {
      try {
        const response = await fetch('https://dev.api.pretamed.com/schedule/fnd/org/638d721322c35b059a46769b'); // Replace with your API URL
        const result = await response.json();

        const parsedEventCards = result.data.map(event => {
          const start = parseISO(event.start);
          const end = parseISO(event.end);
          const dayIndex = days.findIndex(day => format(day, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd'));
          const startHourIndex = start.getHours();
          const startMinuteIndex = Math.floor(start.getMinutes() / interval);
          const endHourIndex = end.getHours();
          const endMinuteIndex = Math.floor(end.getMinutes() / interval);
          const durationInMinutes = differenceInMinutes(end, start);
          const height = (durationInMinutes / 60) * 120; // Adjust the height calculation as needed

          return {
            id: event._id,
            data: event.title,
            startTime: format(start, 'hh:mm a'),
            endTime: format(end, 'hh:mm a'),
            dayIndex,
            startTop: (startHourIndex * 60 + startMinuteIndex * interval) * 2, // Adjust the startTop calculation as needed
            height,
            date: format(start, 'yyyy-MM-dd')
          };
        });

        setEventCards(parsedEventCards);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
console.log(eventCards, 'events')
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
          startTop: calculateStartTop(dayIndex, hourIndex),
        };
      }
      return card;
    });

    setEventCards(updatedEventCards);
  };

  const calculateStartTop = (dayIndex, hourIndex) => {
    const cellHeight = 120;
    const startTop = hourIndex * cellHeight;
    return startTop;
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
    const cellHeight = 120;
    isSelecting.current = false;
    if (selectedCells.length > 0) {
      const startCell = selectedCells[0];
      const endCell = selectedCells[selectedCells.length - 1];
      const startHour = weekHours[format(days[startCell.dayIndex], 'yyyy-MM-dd')][startCell.hourIndex].time;

      const baseTime = new Date();
      let hourInt = parseInt(startHour.split(':')[0], 10);

      if (hourInt < 9) {
        hourInt += 12; 
      }

      baseTime.setHours(hourInt, parseInt(startHour.split(':')[1], 10), 0, 0);

      const startDateTime = new Date(baseTime.getTime() + startCell.slotIndex * interval * 60000);
      const startTime = format(startDateTime, 'HH:mm');
      const duration = selectedCells.length * interval;
      const height = (duration / 60) * cellHeight;
      const newCard = {
        id: unique_id,
        data: 'New Event',
        startTime,
        endTime: format(new Date(startDateTime.getTime() + duration * 60000), 'HH:mm'),
        dayIndex: startCell.dayIndex,
        startTop: startCell.hourIndex * cellHeight,
        height,
        date: format(days[startCell.dayIndex], 'yyyy-MM-dd'),
      };

      setEventCards([...eventCards, newCard]);
    }
    setSelectedCells([]);
    setSelectedCellCount(0);
  };

  const handleHover = (columnIndex, rowIndex, slotCount) => {
    if (columnIndex !== null) {
      setHoveredColumn(columnIndex);
    }
    if (rowIndex !== null) {
      setHoveredRow(rowIndex);
    }
    if (slotCount !== null) {
      setHoveredTimeSlot({ hourIndex: rowIndex, slotIndex: slotCount });
    }
  };

  const handleLeave = () => {
    setHoveredColumn(null);
    setHoveredRow(null);
    setHoveredTimeSlot(null);
  };

  const calculateHeightOfSlot = (slotLength) => {
    const cellHeight = 120;
    const totalPadding = 10;
    const paddingY = (cellHeight - totalPadding) / slotLength;
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
          {weekHours[format(days[0], 'yyyy-MM-dd')].map((hour, hourIndex) => (
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
            {weekHours[format(day, 'yyyy-MM-dd')].map((hour, hourIndex) => {
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
