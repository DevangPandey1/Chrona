'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Task, TaskStats, TaskFilters } from '@/types';
import { tasksApi } from '@/utils/api';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const data = await tasksApi.getAll(filters);
      setTasks(data as Task[]);
      setFilteredTasks(data as Task[]);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await tasksApi.getStats();
      setStats(data as TaskStats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(term.toLowerCase()) ||
      task.description?.toLowerCase().includes(term.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredTasks(filtered);
  };

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      setTasks(tasks.map(task => 
        task._id === taskId 
          ? { ...task, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined }
          : task
      ));
      fetchStats(); // Refresh stats
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksApi.delete(id);
      setTasks(tasks.filter(task => task._id !== id));
      setFilteredTasks(filteredTasks.filter(task => task._id !== id));
      fetchStats(); // Refresh stats
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return false;
    return new Date() > new Date(task.dueDate);
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
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">✅ Tasks</h1>
            <p className="text-blue-100 text-lg">
              Manage your tasks and stay organized
            </p>
          </div>
          <Link href="/tasks/new">
            <Button 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-blue-50 transition-colors"
            >
              ➕ New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                {stats.overdue}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {stats.dueToday}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Due Today</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {stats.completionRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="🔍 Search tasks..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No tasks found"
          description="Create your first task to get started with task management"
          action={{
            label: "Create Task",
            href: "/tasks/new"
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={(e) => handleStatusChange(task._id, e.target.checked ? 'completed' : 'todo')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <h3 className={`text-lg font-medium ${
                      task.status === 'completed' 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </h3>
                    <span className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      task.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    {task.dueDate && (
                      <span className={`flex items-center ${isOverdue(task) ? 'text-red-600 dark:text-red-400' : ''}`}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue(task) && ' (Overdue)'}
                      </span>
                    )}
                    {task.category && (
                      <span className="flex items-center">
                        📁 {task.category}
                      </span>
                    )}
                    {task.estimatedTime && (
                      <span className="flex items-center">
                        ⏱️ {Math.round(task.estimatedTime / 60)}h
                      </span>
                    )}
                  </div>

                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link href={`/tasks/${task._id}`}>
                    <Button variant="secondary">
                      View
                    </Button>
                  </Link>
                  <Link href={`/tasks/${task._id}/edit`}>
                    <Button variant="secondary">
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    onClick={() => handleDelete(task._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 