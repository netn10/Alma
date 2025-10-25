'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from './Navbar';
import { Brain, Loader2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from './providers/LanguageProvider';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const { language, setLanguage } = useLanguage();

  // Navigation function that updates the URL
  const handleNavigate = (route: 'home' | 'signin' | 'signup' | 'settings') => {
    const path = route === 'home' ? '/' : 
                 route === 'signin' ? '/auth/signin' :
                 route === 'signup' ? '/auth/signup' :
                 route === 'settings' ? '/settings' : '/';
    
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      // Trigger a popstate event to update the SPARouter
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-400">Loading Alma...</span>
          </div>
        </div>
      </div>
    );
  }

  // For unauthenticated users, render children without navbar
  if (status === 'unauthenticated') {
    return <>{children}</>;
  }

  // For authenticated users, render with navbar
  return (
    <div className={`h-screen flex flex-col ${language === 'he' ? 'rtl' : 'ltr'}`} dir={language === 'he' ? 'rtl' : 'ltr'}>
      <Navbar 
        onNavigate={handleNavigate}
        voiceLanguage={language}
        onLanguageChange={setLanguage}
      />
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <LanguageProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </LanguageProvider>
  );
}
