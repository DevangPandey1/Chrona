export interface User {
  _id: string;
  username: string;
  email: string;
  token?: string;
}

export interface Note {
  _id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  _id: string;
  userId: string;
  entry: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  name: string;
  count: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  category?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  parentTask?: Task;
  subtasks?: Task[];
  attachments?: Array<{
    filename: string;
    url: string;
    uploadedAt: string;
  }>;
  notes?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  byStatus: {
    [key: string]: number;
  };
  byPriority: {
    [key: string]: number;
  };
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
  search?: string;
}

// Event Types
export interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  color: string;
  type: 'event' | 'meeting' | 'reminder' | 'task' | 'personal' | 'work';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  attendees: Array<{
    email: string;
    name: string;
    response: 'pending' | 'accepted' | 'declined' | 'maybe';
  }>;
  recurring: {
    enabled: boolean;
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endAfter?: number;
    endDate?: string;
  };
  reminders: Array<{
    type: 'email' | 'push' | 'sms';
    time: number; // minutes before event
    sent: boolean;
  }>;
  notes?: string;
  relatedTask?: {
    _id: string;
    title: string;
    status: string;
  };
  relatedNote?: {
    _id: string;
    title: string;
  };
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  todayEvents: number;
  typeStats: {
    [key: string]: number;
  };
  priorityStats: {
    [key: string]: number;
  };
}

export interface EventFilters {
  start?: string;
  end?: string;
  type?: string;
  priority?: string;
  tags?: string;
  search?: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  color: string;
  type: 'event' | 'meeting' | 'reminder' | 'task' | 'personal' | 'work';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  attendees: Array<{
    email: string;
    name: string;
    response: 'pending' | 'accepted' | 'declined' | 'maybe';
  }>;
  recurring: {
    enabled: boolean;
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endAfter?: number;
    endDate?: string;
  };
  reminders: Array<{
    type: 'email' | 'push' | 'sms';
    time: number;
    sent: boolean;
  }>;
  notes?: string;
  relatedTask?: string;
  relatedNote?: string;
} 