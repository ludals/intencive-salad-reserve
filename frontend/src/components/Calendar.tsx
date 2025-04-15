import React from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";

interface CalendarProps {
  reservedDates: string[];
}

export default function Calendar({ reservedDates }: CalendarProps) {
  return (
    <CalendarWrapper>
      <StyledCalendar
        calendarType="gregory"
        tileContent={({ date }) => {
          const formatted = date.toISOString().slice(0, 10);
          const isReserved = reservedDates.includes(formatted);
          return (
            <DayCell>
              <span>Salad Menu</span>
              {isReserved && <SaladIcon src="/icon/salad.png" alt="reserved" />}
            </DayCell>
          );
        }}
      />
    </CalendarWrapper>
  );
}

const CalendarWrapper = styled.div`
  display: flex;

  justify-content: flex-start;
  align-items: flex-start;
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
`;

const DayCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  margin-top: 4px;
`;

const SaladIcon = styled.img`
  width: 30px;
  height: 30px;
  margin-top: 4px;
`;
