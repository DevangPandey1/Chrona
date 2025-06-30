'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { JournalEntry } from '@/types';
import { journalApi } from '@/utils/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function JournalDetailPage() {
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  useEffect(() => {
    if (entryId) {
      fetchEntry();
    }
  }, [entryId]);

  const fetchEntry = async () => {
    try {
      console.log('Fetching journal entry with ID:', entryId);
      // Since we don't have a getById endpoint, we'll fetch all entries and find the one we need
      const entries = await journalApi.getAll();
      const foundEntry = (entries as JournalEntry[]).find(e => e._id === entryId);
      
      if (foundEntry) {
        setEntry(foundEntry);
        setContent(foundEntry.entry);
        console.log('Journal entry found:', foundEntry);
      } else {
        setError('Journal entry not found');
        console.error('Journal entry not found with ID:', entryId);
      }
    } catch (err) {
      console.error('Error fetching journal entry:', err);
      setError('Failed to fetch journal entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!entry) return;

    try {
      console.log('Updating journal entry with ID:', entryId);
      await journalApi.update(entryId, { entry: content });
      setEntry({ ...entry, entry: content });
      setIsEditing(false);
      console.log('Journal entry updated successfully');
    } catch (err) {
      console.error('Error updating journal entry:', err);
      alert('Failed to update journal entry');
    }
  };

  const handleDelete = async () => {
    if (!entry) return;

    if (!window.confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      console.log('Deleting journal entry with ID:', entryId);
      await journalApi.delete(entryId);
      console.log('Journal entry deleted successfully');
      router.push('/journal');
    } catch (err) {
      console.error('Error deleting journal entry:', err);
      alert('Failed to delete journal entry');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading journal entry...</div>
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

  if (!entry) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Journal entry not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Journal Entry - {new Date(entry.date).toLocaleDateString()}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Record your daily experiences and reflections
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/journal/${entry._id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{entry.entry}</p>
        </div>
      </Card>
    </div>
  );
} 