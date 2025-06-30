'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EventFormData, Task, Note } from '@/types';
import { eventsApi, tasksApi, notesApi } from '@/utils/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import TagInput from '@/components/ui/TagInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EVENT_COLORS = [
  { value: '#4f46e5', label: 'Indigo', bg: 'bg-indigo-500' },
  { value: '#10b981', label: 'Green', bg: 'bg-green-500' },
  { value: '#f59e0b', label: 'Amber', bg: 'bg-amber-500' },
  { value: '#ef4444', label: 'Red', bg: 'bg-red-500' },
  { value: '#8b5cf6', label: 'Purple', bg: 'bg-purple-500' },
  { value: '#06b6d4', label: 'Cyan', bg: 'bg-cyan-500' },
  { value: '#84cc16', label: 'Lime', bg: 'bg-lime-500' },
  { value: '#f97316', label: 'Orange', bg: 'bg-orange-500' },
];

const EVENT_TYPES = [
  { value: 'event', label: 'Event' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'task', label: 'Task' },
  { value: 'personal', label: 'Personal' },
  { value: 'work', label: 'Work' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const RECURRING_PATTERNS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    location: '',
    color: '#4f46e5',
    type: 'event',
    priority: 'medium',
    tags: [],
    attendees: [],
    recurring: {
      enabled: false,
      pattern: 'weekly',
      interval: 1,
    },
    reminders: [{ type: 'push', time: 15, sent: false }],
    notes: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        allDay: event.allDay,
        location: event.location || '',
        color: event.color,
        type: event.type,
        priority: event.priority,
        tags: event.tags,
        attendees: event.attendees,
        recurring: event.recurring,
        reminders: event.reminders,
        notes: event.notes || '',
        relatedTask: event.relatedTask?._id || '',
        relatedNote: event.relatedNote?._id || '',
      });
    } else {
      // Set default start and end times for new events
      const now = new Date();
      const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      
      setFormData(prev => ({
        ...prev,
        startDate: startTime.toISOString().slice(0, 16),
        endDate: endTime.toISOString().slice(0, 16),
      }));
    }

    // Load tasks and notes for related items
    const loadRelatedItems = async () => {
      try {
        const [tasksData, notesData] = await Promise.all([
          tasksApi.getAll(),
          notesApi.getAll(),
        ]);
        setTasks(tasksData as Task[]);
        setNotes(notesData as Note[]);
      } catch (error) {
        console.error('Error loading related items:', error);
      }
    };

    loadRelatedItems();
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (event) {
        await eventsApi.update(event._id, formData);
      } else {
        await eventsApi.create(formData);
      }
      
      onSuccess?.();
      if (!onSuccess) {
        router.push('/calendar');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAttendee = () => {
    setFormData(prev => ({
      ...prev,
      attendees: [...prev.attendees, { email: '', name: '', response: 'pending' }],
    }));
  };

  const removeAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index),
    }));
  };

  const updateAttendee = (index: number, field: 'email' | 'name' | 'response', value: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) =>
        i === index ? { ...attendee, [field]: value } : attendee
      ),
    }));
  };

  const addReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { type: 'push', time: 15, sent: false }],
    }));
  };

  const removeReminder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index),
    }));
  };

  const updateReminder = (index: number, field: 'type' | 'time', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map((reminder, i) =>
        i === index ? { ...reminder, [field]: value } : reminder
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              {EVENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {EVENT_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange('color', color.value)}
                  className={`w-8 h-8 rounded-full ${color.bg} ${
                    formData.color === color.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Event description"
            rows={3}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <TagInput
            value={formData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
            placeholder="Add tags..."
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Date & Time
        </h3>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="allDay"
            checked={formData.allDay}
            onChange={(e) => handleInputChange('allDay', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="allDay" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            All day event
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date & Time *
            </label>
            <Input
              type={formData.allDay ? 'date' : 'datetime-local'}
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date & Time *
            </label>
            <Input
              type={formData.allDay ? 'date' : 'datetime-local'}
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <Input
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Event location"
          />
        </div>
      </div>

      {/* Recurring */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="recurring"
            checked={formData.recurring.enabled}
            onChange={(e) => handleInputChange('recurring', {
              ...formData.recurring,
              enabled: e.target.checked
            })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="recurring" className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
            Recurring Event
          </label>
        </div>

        {formData.recurring.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pattern
              </label>
              <select
                value={formData.recurring.pattern}
                onChange={(e) => handleInputChange('recurring', {
                  ...formData.recurring,
                  pattern: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                {RECURRING_PATTERNS.map(pattern => (
                  <option key={pattern.value} value={pattern.value}>
                    {pattern.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interval
              </label>
              <Input
                type="number"
                min="1"
                value={formData.recurring.interval}
                onChange={(e) => handleInputChange('recurring', {
                  ...formData.recurring,
                  interval: parseInt(e.target.value)
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End After (occurrences)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.recurring.endAfter || ''}
                onChange={(e) => handleInputChange('recurring', {
                  ...formData.recurring,
                  endAfter: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder="Never"
              />
            </div>
          </div>
        )}
      </div>

      {/* Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Reminders
        </h3>
        
        {formData.reminders.map((reminder, index) => (
          <div key={index} className="flex items-center gap-4 mb-4">
            <select
              value={reminder.type}
              onChange={(e) => updateReminder(index, 'type', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="push">Push Notification</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>

            <Input
              type="number"
              min="1"
              value={reminder.time}
              onChange={(e) => updateReminder(index, 'time', parseInt(e.target.value))}
              className="w-24"
            />

            <span className="text-sm text-gray-600 dark:text-gray-400">minutes before</span>

            <button
              type="button"
              onClick={() => removeReminder(index)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addReminder}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
        >
          + Add Reminder
        </button>
      </div>

      {/* Attendees */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Attendees
        </h3>
        
        {formData.attendees.map((attendee, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="Name"
              value={attendee.name}
              onChange={(e) => updateAttendee(index, 'name', e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email"
              value={attendee.email}
              onChange={(e) => updateAttendee(index, 'email', e.target.value)}
            />
            <div className="flex items-center gap-2">
              <select
                value={attendee.response}
                onChange={(e) => updateAttendee(index, 'response', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="maybe">Maybe</option>
              </select>
              <button
                type="button"
                onClick={() => removeAttendee(index)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addAttendee}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
        >
          + Add Attendee
        </button>
      </div>

      {/* Related Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Related Items
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Related Task
            </label>
            <select
              value={formData.relatedTask || ''}
              onChange={(e) => handleInputChange('relatedTask', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">No task</option>
              {tasks.map(task => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Related Note
            </label>
            <select
              value={formData.relatedNote || ''}
              onChange={(e) => handleInputChange('relatedNote', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">No note</option>
              {notes.map(note => (
                <option key={note._id} value={note._id}>
                  {note.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Additional Notes
        </h3>
        
        <Textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes about this event..."
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel || (() => router.back())}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
} 