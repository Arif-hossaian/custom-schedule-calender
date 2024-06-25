import React from 'react';

const CalenderView = ({ monthView, setMonthView, weekView, setWeekView, dayView, setDayView, agendaView, setAgendaView }) => {
    return (
        <div className='flex justify-end items-center'>
            <ul className="hidden text-sm font-medium text-center text-gray-500 rounded-lg shadow sm:flex cursor-pointer">
                <li className="w-full focus-within:z-10">
                    <p onClick={() => {
                        setWeekView(false)
                        setDayView(false)
                        setAgendaView(false)
                        setMonthView(!monthView)
                    }} className={`inline-block w-full p-4 text-gray-900 ${monthView && 'bg-gray-200'} border-r border-gray-200`} aria-current="page">Month</p>
                </li>
                <li className="w-full focus-within:z-10">
                    <p onClick={() => {
                        setMonthView(false)
                        setDayView(false)
                        setAgendaView(false)
                        setWeekView(!weekView)
                    }} className={`inline-block w-full p-4 text-gray-900 ${weekView && 'bg-gray-200'} border-r border-gray-200`}>Week</p>
                </li>
                <li className="w-full focus-within:z-10">
                    <p onClick={() => {
                        setMonthView(false)
                        setWeekView(false)
                        setAgendaView(false)
                        setDayView(!dayView)
                    }} className={`inline-block w-full p-4 text-gray-900 ${dayView && 'bg-gray-200'} border-r border-gray-200`}>Day</p>
                </li>
                <li className="w-full focus-within:z-10">
                    <p onClick={() => {
                        setMonthView(false)
                        setWeekView(false)
                        setDayView(false)
                        setAgendaView(!agendaView)
                    }} className={`inline-block w-full p-4 text-gray-900 ${agendaView && 'bg-gray-200'} border-r border-gray-200`}>Agenda</p>
                </li>
            </ul>
        </div>
    );
};

export default CalenderView;
