'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Note, Tag } from '@/types';
import { notesApi } from '@/utils/api';
import NotesList from '@/components/notes/NotesList';
import SearchInput from '@/components/ui/SearchInput';
import Button from '@/components/ui/Button';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
    fetchTags();
  }, [selectedTag]);

  const fetchNotes = async () => {
    try {
      const data = await notesApi.getAll(selectedTag || undefined);
      setNotes(data as Note[]);
      setFilteredNotes(data as Note[]);
    } catch (err) {
      setError('Failed to fetch notes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const data = await notesApi.getTags();
      setTags(data as Tag[]);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(note =>
      note.title.toLowerCase().includes(term.toLowerCase()) ||
      note.content.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredNotes(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      await notesApi.delete(id);
      setNotes(notes.filter(note => note._id !== id));
      setFilteredNotes(filteredNotes.filter(note => note._id !== id));
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
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
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">📝 Notes</h1>
            <p className="text-indigo-100 text-lg">
              Capture your thoughts, ideas, and reminders
            </p>
          </div>
          <Link href="/notes/new">
            <Button 
              variant="secondary" 
              className="bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 border-indigo-200 transition-colors"
            >
              ✏️ New Note
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="🔍 Search notes by title or content..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Stats:</span>
            <span className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full">
              {filteredNotes.length} notes
            </span>
            {selectedTag && (
              <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                Filtered by: {selectedTag}
              </span>
            )}
          </div>
        </div>
        
        {/* Tag Filter */}
        {tags.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by tags:</span>
              {tags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => handleTagSelect(tag.name)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                    selectedTag === tag.name
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  {tag.name} ({tag.count})
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag('')}
                  className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  ✕ Clear filter
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <NotesList
        notes={filteredNotes}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
} 