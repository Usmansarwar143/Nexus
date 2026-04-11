import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Meeting } from '../../types';
import { useAuth } from '../../context/AuthContext';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface MeetingCalendarProps {
  meetings: Meeting[];
  onSelectMeeting?: (meeting: Meeting) => void;
}

export const MeetingCalendar: React.FC<MeetingCalendarProps> = ({ meetings, onSelectMeeting }) => {
  const { user } = useAuth();
  
  const events = useMemo(() => {
    return meetings.map((meeting) => {
      let hours = 0, minutes = 0;
      if (meeting.startTime) {
        const parts = meeting.startTime.split(':');
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
      }
      
      const start = new Date(meeting.date);
      start.setHours(hours, minutes, 0, 0);
      
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + (meeting.durationMinutes || 30));
      
      const otherPersonName = 
          user?.role === 'entrepreneur' ? meeting.investorId?.name : meeting.entrepreneurId?.name;

      return {
        id: meeting._id || meeting.id,
        title: `${meeting.title} - ${otherPersonName || 'Unknown'}`,
        start,
        end,
        resource: meeting,
      };
    });
  }, [meetings, user]);

  const eventStyleGetter = (event: any) => {
    const meeting = event.resource as Meeting;
    let backgroundColor = '#3b82f6'; // blue-500
    if (meeting.status === 'pending') backgroundColor = '#f59e0b'; // amber-500
    if (meeting.status === 'accepted') backgroundColor = '#10b981'; // emerald-500
    if (meeting.status === 'rejected' || meeting.status === 'cancelled') backgroundColor = '#ef4444'; // red-500

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 6px'
      }
    };
  };

  return (
    <div className="h-[600px] w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative z-0">
      {/* 
        Tailwind overrides some button styling, so we use direct styles for react-big-calendar 
        where necessary, but the css import handles most. We wrap in z-0 to avoid overlapping modals.
      */}
      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-event { padding: 2px 5px; }
        .rbc-today { background-color: #f8fafc; }
        .rbc-btn-group button { border-radius: 6px; }
        .rbc-toolbar button:active, .rbc-toolbar button.rbc-active { background-color: #f1f5f9; box-shadow: none; z-index: 0; }
        .rbc-row-segment .rbc-event-content { font-weight: 500; }
        .rbc-header { padding: 8px 0; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: #64748b; }
      `}</style>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(e) => onSelectMeeting && onSelectMeeting(e.resource)}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        tooltipAccessor={(e) => `${e.title} (${e.resource.status})`}
      />
    </div>
  );
};
