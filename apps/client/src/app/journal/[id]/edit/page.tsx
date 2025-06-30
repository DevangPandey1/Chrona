'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { JournalEntry } from '@/types';
import { journalApi } from '@/utils/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Link from 'next/link';

export default function JournalEditPage() {
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
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

  const handleSave = async () => {
    if (!entry || !content.trim()) return;

    setIsSaving(true);
    try {
      console.log('Updating journal entry with ID:', entryId);
      await journalApi.update(entryId, { entry: content });
      console.log('Journal entry updated successfully');
      router.push(`/journal/${entryId}`);
    } catch (err) {
      console.error('Error updating journal entry:', err);
      setError('Failed to update journal entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/journal/${entryId}`);
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
        <Link href="/journal" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-4 inline-block">
          Back to Journal
        </Link>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Journal entry not found</div>
        <Link href="/journal" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-4 inline-block">
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-8 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">✏️ Edit Journal Entry</h1>
            <p className="text-purple-100 text-lg">
              {new Date(entry.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Journal Entry
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, experiences, and reflections..."
              className="min-h-[400px] resize-none"
              disabled={isSaving}
            />
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {content.length} characters
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !content.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 