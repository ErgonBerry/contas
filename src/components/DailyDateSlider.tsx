import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDaysInMonth, startOfMonth, addDays } from 'date-fns';
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

  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);

  // Convert dates to day numbers (1-indexed)
  const getDayNumber = useCallback((date: Date) => date.getDate(), []);

  const initialStartDay = startDate ? getDayNumber(startDate) : 1;
  const initialEndDay = endDate ? getDayNumber(endDate) : daysInMonth;

  const [startDay, setStartDay] = useState(initialStartDay);
  const [endDay, setEndDay] = useState(initialEndDay);

  // Update internal state when props change
  useEffect(() => {
    setStartDay(getDayNumber(startDate));
    setEndDay(getDayNumber(endDate));
  }, [startDate, endDate, getDayNumber]);

  const calculateDayFromMouseEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return 0;
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const clickX = e.clientX - sliderRect.left;
    const percentage = clickX / sliderRect.width;
    let day = Math.round(percentage * (daysInMonth - 1)) + 1; // 1-indexed day
    day = Math.max(1, Math.min(daysInMonth, day)); // Clamp between 1 and daysInMonth
    return day;
  }, [daysInMonth]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const clickedDay = calculateDayFromMouseEvent(e);
    const distanceToStart = Math.abs(clickedDay - startDay);
    const distanceToEnd = Math.abs(clickedDay - endDay);

    if (distanceToStart <= distanceToEnd) {
      setIsDraggingStart(true);
    } else {
      setIsDraggingEnd(true);
    }
  }, [calculateDayFromMouseEvent, startDay, endDay]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingStart && !isDraggingEnd) return;

    const newDay = calculateDayFromMouseEvent(e);

    if (isDraggingStart) {
      let newStart = Math.min(newDay, endDay);
      newStart = Math.max(1, newStart);
      setStartDay(newStart);
      onChange(addDays(monthStart, newStart - 1), addDays(monthStart, endDay - 1));
    } else if (isDraggingEnd) {
      let newEnd = Math.max(newDay, startDay);
      newEnd = Math.min(daysInMonth, newEnd);
      setEndDay(newEnd);
      onChange(addDays(monthStart, startDay - 1), addDays(monthStart, newEnd - 1));
    }
  }, [isDraggingStart, isDraggingEnd, calculateDayFromMouseEvent, endDay, startDay, daysInMonth, monthStart, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const startPercentage = ((startDay - 1) / (daysInMonth - 1)) * 100;
  const endPercentage = ((endDay - 1) / (daysInMonth - 1)) * 100;

  const rangeWidth = endPercentage - startPercentage;
  const rangeLeft = startPercentage;

  return (
    <div
      ref={sliderRef}
      className="relative w-5/6 h-4 rounded-full cursor-pointer flex items-center"
      style={{ backgroundColor: theme.cardBorder }}
      onMouseDown={handleMouseDown}
    >
      {/* Track */}
      <div
        className="absolute h-full rounded-full opacity-70"
        style={{
          left: `${rangeLeft}%`,
          width: `${rangeWidth}%`,
          backgroundColor: theme.primary,
        }}
      ></div>

      {/* Start Thumb */}
      <div
        className="absolute w-5 h-5 rounded-full shadow-md flex items-center justify-center"
        style={{
          left: `calc(${startPercentage}% - 10px)`,
          backgroundColor: theme.primary,
          zIndex: 1,
        }}
      >
        <span className="text-xs font-bold text-white select-none">{startDay}</span>
      </div>

      {/* End Thumb */}
      <div
        className="absolute w-5 h-5 rounded-full shadow-md flex items-center justify-center"
        style={{
          left: `calc(${endPercentage}% - 10px)`,
          backgroundColor: theme.primary,
          zIndex: 1,
        }}
      >
        <span className="text-xs font-bold text-white select-none">{endDay}</span>
      </div>
    </div>
  );
};

export default DailyDateSlider;