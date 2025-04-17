import React from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";

interface CalendarProps {
  reservedDates: string[];
  onDateClick: (
    date: string,
    isReserved: boolean,
    isDeadlineVisible: boolean
  ) => void;
}

const menuByDay = {
  1: "우삼겹쉬림프 샐러드",
  2: "치킨텐더 샐러드",
  3: "치아바타리코타치즈 샐러드",
  4: "불고기파스타 샐러드",
  5: "블랙페퍼닭가슴살 샐러드",
};

const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const holidays = new Set([
  "2025-01-01",
  "2025-01-28",
  "2025-01-29",
  "2025-01-30",
  "2025-03-01",
  "2025-05-05",
  "2025-06-06",
  "2025-08-15",
  "2025-10-03",
  "2025-10-06",
  "2025-10-07",
  "2025-10-08",
  "2025-10-09",
  "2025-12-25",
]);

const getDeadline = (reservedDate: string): string => {
  const d = new Date(reservedDate);
  d.setDate(d.getDate() - 1);

  let businessDays = 0;

  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (!isWeekend(d) && !holidays.has(key)) {
      businessDays++;
      if (businessDays === 2) {
        return key;
      }
    }
    d.setDate(d.getDate() - 1);
  }
};

const toYMD = (date: Date): string => {
  return date.toLocaleDateString("sv-SE");
};

export default function Calendar({
  reservedDates,
  onDateClick,
}: CalendarProps) {
  return (
    <CalendarWrapper>
      <StyledCalendar
        calendarType="gregory"
        tileClassName={({ date }) => {
          const formatted = toYMD(date);
          const isHoliday = isWeekend(date) || holidays.has(formatted);
          const deadline = getDeadline(formatted);

          const now = new Date();
          now.setDate(now.getDate() - 1);
          const isDeadlineOver = now > new Date(deadline);
          const msInDay = 1000 * 60 * 60 * 24;
          const isOverWeek =
            (new Date(deadline).getTime() - now.getTime()) / msInDay > 6;

          const shouldHighlight = !isHoliday && !isDeadlineOver && !isOverWeek;

          return shouldHighlight ? "highlight-cell" : "gray-cell";
        }}
        tileContent={({ date }) => {
          const formatted = toYMD(date);
          const isReserved = reservedDates.includes(formatted);
          const day = date.getDay();

          const saladMenu =
            day >= 1 && day <= 5
              ? menuByDay[day as keyof typeof menuByDay]
              : "";

          const deadline = getDeadline(formatted);
          const now = new Date();
          now.setDate(now.getDate() - 1);
          const isDeadlineOver = now > new Date(deadline);
          const msInDay = 1000 * 60 * 60 * 24;
          const isOverWeek =
            (new Date(deadline).getTime() - now.getTime()) / msInDay > 6;
          const isHoliday = isWeekend(date) || holidays.has(formatted);

          const isDeadlineVisible =
            !isHoliday && !isDeadlineOver && !isOverWeek;

          return (
            <DayCell>
              <span>{saladMenu}</span>
              {isDeadlineVisible && (
                <DeadlineText>마감: {deadline}</DeadlineText>
              )}
              {isReserved && <SaladIcon src="/icon/salad.png" alt="reserved" />}
            </DayCell>
          );
        }}
        onClickDay={(date) => {
          const formatted = toYMD(date);
          const isReserved = reservedDates.includes(formatted);

          const deadline = getDeadline(formatted);
          const now = new Date();
          now.setDate(now.getDate() - 1);
          const isDeadlineOver = now > new Date(deadline);
          const msInDay = 1000 * 60 * 60 * 24;
          const isOverWeek =
            (new Date(deadline).getTime() - now.getTime()) / msInDay > 6;
          const isHoliday = isWeekend(date) || holidays.has(formatted);

          const isDeadlineVisible =
            !isHoliday && !isDeadlineOver && !isOverWeek;

          if (isDeadlineVisible) {
            onDateClick(formatted, isReserved, isDeadlineVisible);
          }
        }}
      />
    </CalendarWrapper>
  );
}

const CalendarWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const StyledCalendar = styled(ReactCalendar)`
  width: 100%;
  background: white;
  border: none;
  font-family: inherit;
  line-height: 1.5;

  .react-calendar__tile {
    height: 100px;
    vertical-align: top;
  }
  .react-calendar__tile--active {
    color: black !important;
    font-weight: bold;
  }

  .react-calendar__tile.highlight-cell {
    background-color: white;
  }

  .react-calendar__tile.gray-cell {
    background-color: #f0f0f0;
  }
`;

const DayCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  margin-top: 4px;
`;

const SaladIcon = styled.img`
  width: 30px;
  height: 30px;
  margin-top: 4px;
`;

const DeadlineText = styled.div`
  font-size: 10px;
  color: red;
  margin-top: 2px;
`;
