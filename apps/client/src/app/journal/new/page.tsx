'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { journalApi } from '@/utils/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function NewJournalEntryPage() {
  const [entry, setEntry] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await journalApi.create({ entry, date });
      router.push('/journal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create journal entry');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Creating journal entry...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Journal Entry</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Record your daily experiences and reflections
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="entry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entry
            </label>
            <Textarea
              id="entry"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Write your journal entry..."
              rows={10}
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Entry'}
            </button>
            <Link href="/journal">
              <button
                type="button"
                className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-gray-700 bg-white font-semibold rounded-lg shadow hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
} 