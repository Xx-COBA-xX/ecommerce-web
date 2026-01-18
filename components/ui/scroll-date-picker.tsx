"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ScrollDatePickerProps {
  date?: Date;
  onDateChange: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

export function ScrollDatePicker({
  date,
  onDateChange,
  minYear = 1900,
  maxYear = new Date().getFullYear() + 10,
  className,
}: ScrollDatePickerProps) {
  const [selectedDay, setSelectedDay] = React.useState<number>(
    date ? date.getDate() : new Date().getDate(),
  );
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    date ? date.getMonth() : new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = React.useState<number>(
    date ? date.getFullYear() : new Date().getFullYear(),
  );

  // Generate arrays for days, months, years
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i,
  );

  React.useEffect(() => {
    if (date) {
      setSelectedDay(date.getDate());
      setSelectedMonth(date.getMonth());
      setSelectedYear(date.getFullYear());
    }
  }, [date]);

  const handleDateUpdate = (d: number, m: number, y: number) => {
    const newDate = new Date(y, m, d);
    // Adjust for invalid dates (e.g., Feb 31)
    if (newDate.getMonth() !== m) {
      newDate.setDate(0); // Last day of previous month
    }
    // Update state to match actual valid date
    setSelectedDay(newDate.getDate());
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());

    onDateChange(newDate);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    handleDateUpdate(day, selectedMonth, selectedYear);
  };

  const handleMonthClick = (index: number) => {
    setSelectedMonth(index);
    handleDateUpdate(selectedDay, index, selectedYear);
  };

  const handleYearClick = (year: number) => {
    setSelectedYear(year);
    handleDateUpdate(selectedDay, selectedMonth, year);
  };

  return (
    <div
      className={cn(
        "flex flex-row-reverse gap-2 h-48 w-full border rounded-md p-2 bg-background",
        className,
      )}
      dir="ltr"
    >
      {/* Years */}
      <div className="flex-1 flex flex-col">
        <div className="text-center text-xs font-semibold text-muted-foreground mb-1">
          السنة
        </div>
        <ScrollArea className="h-full rounded-md border">
          <div className="p-2 space-y-1">
            {years.map((year) => (
              <div
                key={year}
                onClick={() => handleYearClick(year)}
                className={cn(
                  "cursor-pointer text-center text-sm py-1 rounded transition-colors hover:bg-muted",
                  selectedYear === year &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {year}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Months */}
      <div className="flex-1 flex flex-col">
        <div className="text-center text-xs font-semibold text-muted-foreground mb-1">
          الشهر
        </div>
        <ScrollArea className="h-full rounded-md border">
          <div className="p-2 space-y-1">
            {months.map((month, index) => (
              <div
                key={month}
                onClick={() => handleMonthClick(index)}
                className={cn(
                  "cursor-pointer text-center text-sm py-1 rounded transition-colors hover:bg-muted",
                  selectedMonth === index &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {month}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Days */}
      <div className="flex-1 flex flex-col">
        <div className="text-center text-xs font-semibold text-muted-foreground mb-1">
          يوم
        </div>
        <ScrollArea className="h-full rounded-md border">
          <div className="p-2 space-y-1">
            {days.map((day) => (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "cursor-pointer text-center text-sm py-1 rounded transition-colors hover:bg-muted",
                  selectedDay === day &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {day}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
