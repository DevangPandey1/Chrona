'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { JournalEntry } from '@/types';
import { journalApi } from '@/utils/api';
import JournalList from '@/components/journal/JournalList';
import Button from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

export default function JournalPage() {
  const { mounted: themeMounted } = useTheme();
  const { mounted: authMounted } = useAuth();

  if (!themeMounted || !authMounted) {
    return null;
  }

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      console.log('Fetching journal entries...');
      const data = await journalApi.getAll();
      console.log('Journal entries fetched successfully:', data);
      setJournalEntries(data as JournalEntry[]);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError('Failed to fetch journal entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      console.log('Deleting journal entry with ID:', id);
      await journalApi.delete(id);
      console.log('Journal entry deleted successfully');
      setJournalEntries(journalEntries.filter(entry => entry._id !== id));
    } catch (err) {
      console.error('Failed to delete journal entry:', err);
      alert('Failed to delete journal entry');
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
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-8 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">📖 Journal</h1>
            <p className="text-purple-100 text-lg">
              Record your daily experiences and reflections
            </p>
          </div>
          <Link href="/journal/new">
            <Button className="bg-white text-gray-900 dark:bg-gray-800 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-gray-700 border border-purple-300 dark:border-purple-600 transition-colors font-semibold">
              ✍️ New Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {journalEntries.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {journalEntries.length > 0 ? new Date(journalEntries[0].date).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Latest Entry</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {new Date().getDate()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Today's Date</div>
          </div>
        </div>
      </div>

      <JournalList
        entries={journalEntries}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
} 