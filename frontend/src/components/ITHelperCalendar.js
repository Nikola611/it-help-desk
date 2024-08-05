import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function ITHelperCalendar({ helperId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchSchedule() {
      const response = await fetch(`http://localhost:5000/auth/it-helper-schedule/${helperId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setEvents(data.map(event => ({
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: false
      })));
    }

    if (helperId) {
      fetchSchedule();
    }
  }, [helperId]);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  );
}

export default ITHelperCalendar;
