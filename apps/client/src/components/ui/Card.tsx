import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export default function Card({ children, className = '', actions }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="p-6">
        {children}
      </div>
      {actions && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          {actions}
        </div>
      )}
    </div>
  );
} 