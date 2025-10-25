'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';

interface UserMenuProps {
  onNavigate?: (route: 'home' | 'signin' | 'signup' | 'settings') => void;
  isRTL?: boolean;
}

export function UserMenu({ onNavigate, isRTL = false }: UserMenuProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex flex-col items-center ${isRTL ? 'space-y-reverse space-y-1' : 'space-y-1'} text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95`}
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
        )}
        <span className="text-sm font-medium">{session.user.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700 ${isRTL ? 'left-0' : 'right-0'}`}>
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <p className="font-medium">{session.user.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{session.user.email}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate?.('settings');
              }}
              className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 ${isRTL ? 'hover:-translate-x-1' : 'hover:translate-x-1'}`}
            >
              <Settings className={`w-4 h-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              Settings
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 ${isRTL ? 'hover:-translate-x-1' : 'hover:translate-x-1'}`}
            >
              <LogOut className={`w-4 h-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
