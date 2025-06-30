'use client';

import { useState } from 'react';
import { Note, JournalEntry, Event } from '@/types';
import Link from 'next/link';
import Card from '@/components/ui/Card';

interface CalendarProps {
  notes: Note[];
  journalEntries: JournalEntry[];
  events: Event[];
  isLoading?: boolean;
  onDayClick?: (date: string) => void;
  onEventClick?: (event: Event) => void;
}

interface DayData {
  date: Date;
  notes: Note[];
  journalEntries: JournalEntry[];
  isCurrentMonth: boolean;
}

export default function Calendar({ notes, journalEntries, events, isLoading, onDayClick, onEventClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEntriesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    const notesForDate = notes.filter(note => {
      const noteDate = new Date(note.createdAt).toISOString().split('T')[0];
      return noteDate === dateString;
    });

    const journalForDate = journalEntries.filter(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return entryDate === dateString;
    });

    const eventsForDate = events.filter(event => {
      const start = new Date(event.startDate).toISOString().split('T')[0];
      const end = new Date(event.endDate).toISOString().split('T')[0];
      return dateString >= start && dateString <= end;
    });

    return { notes: notesForDate, journal: journalForDate, events: eventsForDate };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const isToday = (day: number) => {
      return currentDate.getMonth() === today.getMonth() &&
             currentDate.getFullYear() === today.getFullYear() &&
             day === today.getDate();
    };

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const { notes, journal, events: dayEvents } = getEntriesForDate(date);
      const hasEntries = notes.length > 0 || journal.length > 0 || dayEvents.length > 0;

      days.push(
        <div
          key={day}
          className={`p-2 min-h-[120px] border border-gray-200 dark:border-gray-700 cursor-pointer group ${
            isToday(day) 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' 
              : 'bg-white dark:bg-gray-800'
          }`}
          onClick={() => onDayClick && onDayClick(dateString)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${
              isToday(day) 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {day}
            </span>
            {hasEntries && (
              <div className="flex space-x-1">
                {notes.length > 0 && (
                  <span className="w-2 h-2 bg-green-500 rounded-full" title={`${notes.length} note(s)`}></span>
                )}
                {journal.length > 0 && (
                  <span className="w-2 h-2 bg-purple-500 rounded-full" title={`${journal.length} journal entry(ies)`}></span>
                )}
                {dayEvents.length > 0 && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" title={`${dayEvents.length} event(s)`}></span>
                )}
              </div>
            )}
          </div>
          {hasEntries && (
            <div className="mt-1 space-y-1">
              {notes.slice(0, 2).map(note => (
                <Link key={note._id} href={`/notes/${note._id}`} className="block">
                  <div className="text-xs text-green-600 dark:text-green-400 truncate hover:underline cursor-pointer">
                    📝 {note.title}
                  </div>
                </Link>
              ))}
              {journal.slice(0, 2).map(entry => (
                <Link key={entry._id} href={`/journal/${entry._id}`} className="block">
                  <div className="text-xs text-purple-600 dark:text-purple-400 truncate hover:underline cursor-pointer">
                    📖 {entry.entry.substring(0, 20)}...
                  </div>
                </Link>
              ))}
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event._id}
                  className="text-xs truncate cursor-pointer rounded px-1 py-0.5 mt-1"
                  style={{ background: event.color, color: '#fff' }}
                  onClick={e => {
                    e.stopPropagation();
                    onEventClick && onEventClick(event);
                  }}
                  title={event.title}
                >
                  📅 {event.title}
                </div>
              ))}
              {(notes.length + journal.length + dayEvents.length > 4) && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{notes.length + journal.length + dayEvents.length - 4} more
                </div>
              )}
            </div>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-500 mt-2 text-center">
            + Add/View Events
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{monthName}</h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 dark:bg-gray-800 p-2 text-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{day}</span>
          </div>
        ))}
        {renderCalendarDays()}
      </div>

      <div className="mt-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Legend</h3>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Journal Entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Events</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 