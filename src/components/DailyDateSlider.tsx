import React, { useState, useEffect, useRef } from 'react';
import { format, getDaysInMonth, startOfMonth, endOfMonth, addDays, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';

interface DailyDateSliderProps {
  currentMonth: Date;
  startDate: Date;
  endDate: Date;
  onChange: (newStartDate: Date, newEndDate: Date) => void;
}

const DailyDateSlider: React.FC<DailyDateSliderProps> = ({
  currentMonth,
  startDate,
  endDate,
  onChange,
}) => {
  const { theme } = useTheme();
  const daysInMonth = getDaysInMonth(currentMonth);
  const monthStart = startOfMonth(currentMonth);

  // Convert dates to day numbers (1-indexed)
  const initialStartDay = startDate ? (startDate.getDate()) : 1;
  const initialEndDay = endDate ? (endDate.getDate()) : daysInMonth;

  const [startDay, setStartDay] = useState(initialStartDay);
  const [endDay, setEndDay] = useState(initialEndDay);

  // Update internal state when props change
  useEffect(() => {
    setStartDay(startDate ? (startDate.getDate()) : 1);
    setEndDay(endDate ? (endDate.getDate()) : daysInMonth);
  }, [startDate, endDate, daysInMonth]);

  const handleStartDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newStart = parseInt(e.target.value, 10);
    if (newStart > endDay) {
      newStart = endDay; // Ensure start is not after end
    }
    setStartDay(newStart);
    onChange(addDays(monthStart, newStart - 1), addDays(monthStart, endDay - 1));
  };

  const handleEndDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newEnd = parseInt(e.target.value, 10);
    if (newEnd < startDay) {
      newEnd = startDay; // Ensure end is not before start
    }
    setEndDay(newEnd);
    onChange(addDays(monthStart, startDay - 1), addDays(monthStart, newEnd - 1));
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <input
        type="range"
        min={1}
        max={daysInMonth}
        value={startDay}
        onChange={handleStartDayChange}
        className="w-1/2 h-2 rounded-lg appearance-none cursor-pointer" 
        style={{ background: theme.primary }}
      />
      <input
        type="range"
        min={1}
        max={daysInMonth}
        value={endDay}
        onChange={handleEndDayChange}
        className="w-1/2 h-2 rounded-lg appearance-none cursor-pointer" 
        style={{ background: theme.primary }}
      />
    </div>
  );
};

export default DailyDateSlider;
