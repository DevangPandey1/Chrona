'use client';

import { useState, useEffect } from 'react';
import { Note, JournalEntry, Event } from '@/types';
import { notesApi, journalApi, eventsApi } from '@/utils/api';
import Calendar from '@/components/calendar/Calendar';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import EventForm from '@/components/events/EventForm';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function CalendarPage() {
  const { mounted: themeMounted } = useTheme();
  const { mounted: authMounted } = useAuth();

  if (!themeMounted || !authMounted) {
    return null;
  }

  const [notes, setNotes] = useState<Note[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesData, journalData, eventsData] = await Promise.all([
          notesApi.getAll(),
          journalApi.getAll(),
          eventsApi.getAll(),
        ]);
        setNotes(notesData as Note[]);
        setJournalEntries(journalData as JournalEntry[]);
        setEvents(eventsData as Event[]);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenEventModal = (date?: string) => {
    setSelectedEvent(null);
    setSelectedDate(date || null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseEventModal = () => {
    setSelectedEvent(null);
    setSelectedDate(null);
    setShowEventModal(false);
  };

  const handleEventSuccess = async () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    setIsLoading(true);
    try {
      const eventsData = await eventsApi.getAll();
      setEvents(eventsData as Event[]);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-8 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">📅 Calendar</h1>
            <p className="text-green-100 text-lg">
              View your notes, journal entries, and events by date
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/notes/new">
              <Button className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors font-semibold">
                📝 New Note
              </Button>
            </Link>
            <Link href="/journal/new">
              <Button className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors font-semibold">
                📖 New Entry
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {notes.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Notes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {journalEntries.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Journal Entries</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {new Date().toLocaleDateString('en-US', { month: 'long' })}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Month</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {new Date().getFullYear()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Year</div>
          </div>
        </div>
      </div>

      <Calendar
        notes={notes}
        journalEntries={journalEntries}
        events={events}
        isLoading={isLoading}
        onDayClick={handleOpenEventModal}
        onEventClick={handleEditEvent}
      />

      {/* Floating New Event Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 text-2xl focus:outline-none focus:ring-2 focus:ring-green-400"
        onClick={() => handleOpenEventModal()}
        title="Add New Event"
      >
        +
      </button>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={handleCloseEventModal} />
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-auto p-6 z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={handleCloseEventModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <EventForm
                event={selectedEvent || undefined}
                onSuccess={handleEventSuccess}
                onCancel={handleCloseEventModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 