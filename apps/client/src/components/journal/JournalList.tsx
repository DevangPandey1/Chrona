import { JournalEntry } from '@/types';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface JournalListProps {
  entries: JournalEntry[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function JournalList({ entries, onDelete, isLoading }: JournalListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 dark:bg-gray-700 h-32 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No journal entries yet</p>
        <Link href="/journal/new" className="mt-4 inline-block">
          <Button>Write your first entry</Button>
        </Link>
      </div>
    );
  }

  // Group entries by month
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(entry);
    return groups;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
        <div key={monthYear}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{monthYear}</h2>
          <div className="space-y-4">
            {monthEntries.map((entry) => (
              <Card
                key={entry._id}
                className="hover:shadow-md transition-shadow"
                actions={
                  onDelete && (
                    <Button
                      variant="danger"
                      onClick={() => onDelete(entry._id)}
                      className="text-sm"
                    >
                      Delete
                    </Button>
                  )
                }
              >
                <Link href={`/journal/${entry._id}`} className="block">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      {new Date(entry.date).toLocaleDateString('default', {
                        weekday: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">{entry.entry}</p>
                  {entry.updatedAt !== entry.createdAt && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                      Edited: {new Date(entry.updatedAt).toLocaleString()}
                    </p>
                  )}
                </Link>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 