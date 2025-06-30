import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Chrona
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your personal daily life management app. Organize your thoughts, track your experiences, 
            and stay productive with notes, journal entries, and calendar integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Create Account</Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Capture your thoughts, ideas, and reminders with rich text formatting
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Journal</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Record your daily experiences and reflections
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Calendar</h3>
              <p className="text-gray-600 dark:text-gray-400">
                View your notes and journal entries organized by date
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
