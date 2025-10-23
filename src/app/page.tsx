'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col">
        {/* Header with user menu - mobile responsive */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">Alma</h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Your AI mentor for HR</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
        
        {/* Chat interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface userId={session?.user?.id || ''} />
        </div>
      </div>
    </AuthGuard>
  );
}