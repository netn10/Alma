'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserMenu } from './auth/UserMenu';
import { ThemeToggle } from './ui/ThemeToggle';
import { LanguageSelector } from './chat/LanguageSelector';
import { AlmaLogo } from './ui/AlmaLogo';

interface NavbarProps {
  onNavigate?: (route: 'home' | 'signin' | 'signup' | 'settings') => void;
  voiceLanguage?: string;
  onLanguageChange?: (language: string) => void;
}

export function Navbar({ onNavigate, voiceLanguage = 'en', onLanguageChange }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 flex justify-between items-center">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={() => onNavigate?.('home')}
          className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity group"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <AlmaLogo size={32} className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">Alma</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {voiceLanguage === 'he' ? 'המנטור הדיגיטלי שלך למשאבי אנוש' : 'Your AI mentor for HR'}
            </p>
          </div>
        </button>
      </div>
      <div className={`flex items-center ${voiceLanguage === 'he' ? 'space-x-reverse space-x-1 sm:space-x-2' : 'space-x-1 sm:space-x-2'}`}>
        <LanguageSelector
          selectedLanguage={voiceLanguage}
          onLanguageChange={onLanguageChange}
          isRTL={voiceLanguage === 'he'}
        />
        <ThemeToggle />
        <UserMenu onNavigate={onNavigate} isRTL={voiceLanguage === 'he'} />
      </div>
    </div>
  );
}
