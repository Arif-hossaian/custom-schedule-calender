import React, { useState, useEffect, useRef } from 'react';
import { getWeekDays, formatDate, getDayHours, parseDate } from '../../utils/dateUtlis';
import { v4 as uuid } from "uuid";
import { differenceInCalendarDays, format, startOfDay } from 'date-fns'; // Import format from date-fns

const EventCard = ({ data, startTime, endTime, startTop, height, date }) => {
  return (
    <div style={{ height: `${height}px`, top: startTop, position: 'absolute', backgroundColor: 'lightblue', zIndex: 10, cursor: 'pointer', width: '95%' }}>
      <div className='flex justify-start items-center'>
        <p>{data}</p>
        <p className='ml-2'>{startTime} - {endTime}</p>
        {/* <p>{date}</p> */}
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

//console.log(eventCards, 'events')

let events = [
  {
    id: 'd2ea8833',
    data: 'test',
    date:"2024-06-23",
    startTime: '12:00 PM',
    endTime: '12:15 PM',
    dayIndex: 0,
    startTop:360
  },
  {
    id: 'b2da109d',
    data: 'trs',
    date:"2024-06-28",
    startTime: '10:30 AM',
    endTime: '10:45 AM',
    dayIndex: 5,
    startTop:180
  },
  {
    id: '49577dfa',
    data: 'ytr',
    startTime: '09:30 AM',
    date:"2024-06-25",
    endTime: '09:45 AM',
    dayIndex: 2,
    startTop:60
  },
  {
    id: 'f815272e',
    data: 'rer',
    date:"2024-06-29",
    startTime: '12:30 PM',
    endTime: '12:45 PM',
    dayIndex: 6,
    startTop:420
    // other properties as needed
  }
];

const apiEvents = [
  {
    active: true,
    billed: true,
    contacts: "",
    createDate: "2024-06-03T06:27:05.531Z",
    creatorId: "",
    delete: false,
    details: "",
    end: new Date("Sat Jun 2024 11:00:00 GMT+0600 (Bangladesh Standard Time)"),
    faxed: true,
    hasNoteId: true,
    isCanceled: false,
    isPatientArrived: false,
    isPostponed: false,
    medicalStaffId: "63f22a07fce1f2767946a634",
    note: "",
    noteId: "tst-nt1231",
    organizationId: "638d721322c35b059a46769b",
    patientId: "63b3b8c1308fcc173b7cb5ab",
    phn: "466612",
    postpondDate: "",
    resource: { contactNumber: '' },
    scheduledTime: "",
    signed: true,
    start: new Date("Sat Jun 30 2024 10:45:00 GMT+0600 (Bangladesh Standard Time)"),
    status: true,
    title: "Uddin, Rafiq  - 466612",
    typeId: "659252e4dc56a4660b187469",
    typeOfVisit: "New Patient",
    update: false,
    updateDate: "",
    _id: "6594fe393543b0109606dcae"
  },
  {
    active: true,
    billed: false,
    contacts: "1649894",
    createDate: "2024-07-03T06:27:32.878Z",
    creatorId: "",
    delete: false,
    details: "",
    end: new Date("Thu July 04 2024 9:15:00 GMT+0600 (Bangladesh Standard Time)"),
    faxed: false,
    hasNoteId: true,
    isCanceled: false,
    isPatientArrived: false,
    isPostponed: false,
    medicalStaffId: "63f22a07fce1f2767946a634",
    note: "",
    noteId: "tst-nt123",
    organizationId: "638d721322c35b059a46769b",
    patientId: "63bd76a84186ccf1081ae354",
    phn: "8494231231",
    postpondDate: "",
    resource: { contactNumber: '1649894' },
    scheduledTime: "",
    signed: false,
    start: new Date("Thu July 04 2024 9:00:00 GMT+0600 (Bangladesh Standard Time)"),
    status: true,
    title: "Islam, Salam Ahmed - 8494231231",
    typeId: "65956fe63543b0109606de6c",
    typeOfVisit: "Chronic Care Patients",
    update: false,
    updateDate: "2024-01-04T04:12:15.629Z",
    updated: true,
    _id: "6594fe543543b0109606dcaf"
  }
];


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

  // const handleSlotClick = (dayIndex, hourIndex, slotIndex) => {
  //   const text = prompt('Enter text for this slot:');
  //   if (text !== null) {
  //     let newSlots = slots.slice();
  //     const existingSlotIndex = newSlots.findIndex(
  //       (slot) =>
  //         slot.dayIndex === dayIndex &&
  //         slot.hourIndex === hourIndex &&
  //         slot.slotIndex === slotIndex
  //     );

  //     if (existingSlotIndex > -1) {
  //       newSlots[existingSlotIndex] = { ...newSlots[existingSlotIndex], text };
  //     } else {
  //       newSlots.push({ dayIndex, hourIndex, slotIndex, text });
  //     }

  //     setSlots(newSlots);
  //   }
  // };
//console.log(slots, 'slots')

const calculateDayIndex = (date) => {
  const startOfWeek = startOfDay(days[0]);
  return differenceInCalendarDays(new Date(date), startOfWeek);
};

const calculateStartTop = (startTime) => {
  const [hours, minutes] = startTime.split(':');
  const timeInMinutes = parseInt(hours) * 60 + parseInt(minutes);
  return (timeInMinutes / interval) * 2; // Adjust based on your slot height and interval
};

useEffect(() => {
  const formattedEvents = apiEvents.map(event => {
    const startTime = format(new Date(event.start), 'HH:mm');
    const endTime = format(new Date(event.end), 'HH:mm');
    const dayIndex = calculateDayIndex(event.start);
    const startTop = calculateStartTop(startTime);
    const height = ((new Date(event.end) - new Date(event.start)) / 60000 / interval) * 24; // Adjust based on your slot height and interval

    return {
      id: event._id,
      data: event.title,
      startTime,
      endTime,
      dayIndex,
      startTop,
      height,
      date: format(new Date(event.start), 'yyyy-MM-dd')
    };
  });

  setEventCards(formattedEvents);
}, []);

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
    //console.log(dayIndex, 'dayIndex')
    //console.log(hourIndex, 'hourindex')
    //console.log(slotIndex, 'slotindex')
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

  // const handleMouseUp = () => {
  //   const cellHeight = 120
  //   isSelecting.current = false;
  //   if (selectedCells.length > 0) {
  //     const startCell = selectedCells[0];
  //     const endCell = selectedCells[selectedCells.length - 1];
  //     const startHour = weekHours[format(days[startCell.dayIndex], 'yyyy-MM-dd')][startCell.hourIndex].time;

  //     const baseTime = new Date();
  //     let hourInt = parseInt(startHour.split(':')[0], 10);

  //     if (hourInt < 9) {
  //       hourInt += 12; 
  //     }

  //     baseTime.setHours(hourInt, parseInt(startHour.split(':')[1], 10), 0, 0);

  //     const startDateTime = new Date(baseTime.getTime() + startCell.slotIndex * interval * 60000);
  //     const startTime = format(startDateTime, 'hh:mm a');

  //     const endDateTime = new Date(baseTime.getTime() + (endCell.hourIndex - startCell.hourIndex) * 60 * 60000 + (endCell.slotIndex + 1) * interval * 60000);
  //     const endTime = format(endDateTime, 'hh:mm a');

  //     const durationInMinutes = (endDateTime.getTime() - startDateTime.getTime()) / 60000;
  //     const height = (durationInMinutes / 60) * cellHeight; // Adjust this to fit your slot height

  //     const text = prompt('Enter text for this event:');
  //     if (text) {
  //       setEventCards((prev) => [
  //         ...prev,
  //         {
  //           id: unique_id.slice(0, 8),
  //           data: text,
  //           startTime,
  //           endTime,
  //           dayIndex: startCell.dayIndex,
  //           startTop: startCell.hourIndex * cellHeight + startCell.slotIndex * (cellHeight / (60 / interval)),
  //           height,
  //           date: format(days[startCell.dayIndex], 'yyyy-MM-dd') // Set the date here
  //         },
  //       ]);
  //     }
  //     setSelectedCells([]);
  //     setSelectedCellCount(0);
  //   }
  // };


  const handleMouseUp = () => {
    const cellHeight = 120
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
      const startTime = format(startDateTime, 'hh:mm a');

      const endDateTime = new Date(baseTime.getTime() + (endCell.hourIndex - startCell.hourIndex) * 60 * 60000 + (endCell.slotIndex + 1) * interval * 60000);
      const endTime = format(endDateTime, 'hh:mm a');

      const durationInMinutes = (endDateTime.getTime() - startDateTime.getTime()) / 60000;
      const height = (durationInMinutes / 60) * cellHeight; // Adjust this to fit your slot height

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
            startTop: startCell.hourIndex * cellHeight + startCell.slotIndex * (cellHeight / (60 / interval)),
            height,
            date: format(days[startCell.dayIndex], 'yyyy-MM-dd')
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
  //console.log(days[0], 'days')

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
            {formatDate(day, 'MMMM d')}
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
                          //onClick={() => handleSlotClick(dayIndex, hourIndex, index)}
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
                    date={card.date}
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
