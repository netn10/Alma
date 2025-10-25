'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ChatInterface } from './chat/ChatInterface';
import { AuthGuard } from './auth/AuthGuard';
import { UserMenu } from './auth/UserMenu';
import { ThemeToggle } from './ui/ThemeToggle';
import { LanguageSelector } from './chat/LanguageSelector';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { SettingsPage } from './pages/SettingsPage';
import { Brain, Loader2 } from 'lucide-react';

type Route = 'home' | 'signin' | 'signup' | 'settings';

export function SPARouter() {
  const { data: session, status } = useSession();
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [voiceLanguage, setVoiceLanguage] = useState<string>('en');

  // Handle initial route based on authentication status
  useEffect(() => {
    if (status === 'unauthenticated') {
      setCurrentRoute('signin');
    } else if (status === 'authenticated') {
      setCurrentRoute('home');
    }
  }, [status]);

  // Navigation functions
  const navigateTo = (route: Route) => {
    setCurrentRoute(route);
  };

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
        setCurrentRoute('home');
      } else if (path === '/auth/signin') {
        setCurrentRoute('signin');
      } else if (path === '/auth/signup') {
        setCurrentRoute('signup');
      } else if (path === '/settings') {
        setCurrentRoute('settings');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when route changes
  useEffect(() => {
    const path = currentRoute === 'home' ? '/' : 
                 currentRoute === 'signin' ? '/auth/signin' :
                 currentRoute === 'signup' ? '/auth/signup' :
                 currentRoute === 'settings' ? '/settings' : '/';
    
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, [currentRoute]);

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

  // Render sign in page
  if (currentRoute === 'signin') {
    return <SignInPage onNavigate={navigateTo} />;
  }

  // Render sign up page
  if (currentRoute === 'signup') {
    return <SignUpPage onNavigate={navigateTo} />;
  }

  // Render settings page
  if (currentRoute === 'settings') {
    return <SettingsPage onNavigate={navigateTo} />;
  }

  // Render main app (home)
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
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {voiceLanguage === 'he' ? 'המנטור הדיגיטלי שלך למשאבי אנוש' : 'Your AI mentor for HR'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <LanguageSelector
              selectedLanguage={voiceLanguage}
              onLanguageChange={setVoiceLanguage}
            />
            <ThemeToggle />
            <UserMenu onNavigate={navigateTo} />
          </div>
        </div>
        
        {/* Chat interface */}
        <div className="flex-1 min-h-0">
          <ChatInterface userId={session?.user?.id || ''} voiceLanguage={voiceLanguage} />
        </div>
      </div>
    </AuthGuard>
  );
}
