'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Note, JournalEntry, TaskStats } from '@/types';
import { notesApi, journalApi, tasksApi } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { mounted } = useAuth();

  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
      try {
        const [notesData, journalData, taskStatsData] = await Promise.all([
          notesApi.getAll(),
          journalApi.getAll(),
          tasksApi.getStats().catch(() => null), // Don't fail if tasks API is not ready
        ]);
        setNotes((notesData as Note[]).slice(0, 5)); // Show only 5 most recent notes
        setJournalEntries((journalData as JournalEntry[]).slice(0, 5)); // Show only 5 most recent entries
        setTaskStats(taskStatsData as TaskStats);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <div className="mt-4 text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const getTotalTags = () => {
    const allTags = notes.reduce((tags, note) => tags.concat(note.tags || []), [] as string[]);
    return [...new Set(allTags)].length;
  };

  const getRecentActivity = () => {
    const allItems = [
      ...notes.map(note => ({ ...note, type: 'note' as const })),
      ...journalEntries.map(entry => ({ ...entry, type: 'journal' as const }))
    ];
    return allItems
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <div className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</div>
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-indigo-100 text-lg">Ready to organize your thoughts and track your journey?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{notes.length}</h3>
            <p className="text-gray-600 dark:text-gray-400">Total Notes</p>
          </div>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{journalEntries.length}</h3>
            <p className="text-gray-600 dark:text-gray-400">Journal Entries</p>
          </div>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{taskStats?.total || 0}</h3>
            <p className="text-gray-600 dark:text-gray-400">Total Tasks</p>
          </div>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="p-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🏷️</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{getTotalTags()}</h3>
            <p className="text-gray-600 dark:text-gray-400">Unique Tags</p>
          </div>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="p-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{new Date().getDate()}</h3>
            <p className="text-gray-600 dark:text-gray-400">Today's Date</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/notes/new">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✏️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Create New Note
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Write down your thoughts, ideas, or reminders
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/tasks/new">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Create New Task
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add a new task to your to-do list
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/journal/new">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Write Journal Entry
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Record your daily experiences and reflections
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link href="/calendar">
            <Button variant="secondary">View Calendar</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Notes */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Notes</h3>
                <Link href="/notes">
                  <span className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                    View all
                  </span>
                </Link>
              </div>
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <Link key={note._id} href={`/notes/${note._id}`}>
                      <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{note.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{note.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {note.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                              {note.tags.length > 2 && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">+{note.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No notes yet</p>
              )}
            </div>
          </Card>

          {/* Recent Journal Entries */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Journal Entries</h3>
                <Link href="/journal">
                  <span className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">
                    View all
                  </span>
                </Link>
              </div>
              {journalEntries.length > 0 ? (
                <div className="space-y-3">
                  {journalEntries.map((entry) => (
                    <Link key={entry._id} href={`/journal/${entry._id}`}>
                      <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{entry.entry}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                            Journal
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No journal entries yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 