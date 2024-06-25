import React from 'react';
import { format } from 'date-fns';

const DayHeader = ({ currentDate }) => {
    //console.log(currentDate, 'curr')
    //const goToPreviousDay = () => setCurrentDate(subMonths(currentDate, 1));
    //const goToNextDay = () => setCurrentDate(addMonths(currentDate, 1));

    return (
        <div className="flex justify-between p-4 bg-gray-200">
            <button className="text-xl">&lt;</button>
            <div>{format(currentDate, `EEEE MMM dd, yyyy`)} <span className='font-mono ml-5 underline'>Daily</span></div>
            <button className="text-xl">&gt;</button>
        </div>
    );
};

export default DayHeader;
