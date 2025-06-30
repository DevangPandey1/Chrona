import { Note } from '@/types';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface NotesListProps {
  notes: Note[];
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export default function NotesList({ notes, onDelete, isLoading }: NotesListProps) {
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

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No notes yet</p>
        <Link href="/notes/new" className="mt-4 inline-block">
          <Button>Create your first note</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card
          key={note._id}
          className="hover:shadow-md transition-shadow"
          actions={
            onDelete && (
              <Button
                variant="danger"
                onClick={() => onDelete(note._id)}
                className="text-sm"
              >
                Delete
              </Button>
            )
          }
        >
          <Link href={`/notes/${note._id}`} className="block">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{note.title}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">{note.content}</p>
            {note.tags && note.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
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
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              Created: {new Date(note.createdAt).toLocaleDateString()}
              {note.updatedAt !== note.createdAt && (
                <span className="ml-4">
                  Updated: {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
} 