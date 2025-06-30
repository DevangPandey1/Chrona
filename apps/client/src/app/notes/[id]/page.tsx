'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { notesApi } from '@/utils/api';
import { Note, Tag } from '@/types';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import RichTextEditor from '@/components/ui/RichTextEditor';
import TagInput from '@/components/ui/TagInput';
import Button from '@/components/ui/Button';

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNote();
    fetchAvailableTags();
  }, [noteId]);

  const fetchNote = async () => {
    try {
      const data = await notesApi.getAll();
      const foundNote = (data as Note[]).find(n => n._id === noteId);
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        setContent(foundNote.content);
        setTags(foundNote.tags || []);
      }
    } catch (err) {
      setError('Failed to fetch note');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const data = await notesApi.getTags();
      setAvailableTags(data as Tag[]);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const handleUpdate = async () => {
    if (!note) return;
    
    setIsSaving(true);
    setError('');

    try {
      await notesApi.update(note._id, {
        title,
        content,
        tags: tags.join(','),
      });
      
      // Update local state
      setNote({
        ...note,
        title,
        content,
        tags,
        updatedAt: new Date().toISOString(),
      });
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await notesApi.delete(note._id);
      router.push('/notes');
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
    }
  };

  const handleCancelEdit = () => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
    }
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading note...</div>
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Note not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Note' : note.title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isEditing ? 'Update your note with rich formatting' : 'View and manage your note'}
          </p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        {isEditing ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
                required
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <TagInput
                value={tags}
                onChange={setTags}
                availableTags={availableTags}
                placeholder="Add tags (press Enter or comma to add)"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your note content..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{note.title}</h2>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div 
                className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(note.createdAt).toLocaleDateString()}
                {note.updatedAt !== note.createdAt && (
                  <span className="ml-4">
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 