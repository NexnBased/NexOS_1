import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const today = dayjs();
  const firstDayOfWeek = currentDate.day();
  const daysInMonth = currentDate.daysInMonth();
  const startOfMonth = currentDate.startOf("month");
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="flex h-full w-full items-center justify-center p-4 select-none">
      <div className="flex w-full max-w-70 flex-col sm:max-w-[320px]">
        <div className="mb-4 flex items-center justify-between px-2">
          <span className="text-sm font-bold tracking-wide text-purple-950">
            {currentDate.format("MMMM YYYY")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
              className="flex size-7 items-center justify-center rounded-full! text-purple-950 transition-colors hover:bg-zinc-900 hover:text-purple-200"
            >
              <ChevronLeft className="size-5" strokeWidth={2} />
            </button>
            <button
              onClick={() => setCurrentDate(currentDate.add(1, "month"))}
              className="flex size-7 items-center justify-center rounded-full! text-purple-950 transition-colors hover:bg-zinc-900 hover:text-purple-200"
            >
              <ChevronRight className="size-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="flex h-8 items-center justify-center text-xs font-semibold text-zinc-950/90"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="flex size-8 sm:size-10" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = startOfMonth.add(index, "day");
            const isSelected = selectedDate?.isSame(date, "day");
            const isToday = today.isSame(date, "day");

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex size-8 items-center justify-center rounded-md text-sm transition-colors sm:size-10 ${
                  isSelected
                    ? "bg-purple-600 font-normal text-white"
                    : isToday
                      ? "bg-purple-500/90 font-bold text-purple-50"
                      : "text-zinc-600 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                {date.date()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
