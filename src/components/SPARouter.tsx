'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ChatInterface } from './chat/ChatInterface';
import { AuthGuard } from './auth/AuthGuard';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { SettingsPage } from './pages/SettingsPage';
import { Brain, Loader2 } from 'lucide-react';
import { useLanguage } from './providers/LanguageProvider';

type Route = 'home' | 'signin' | 'signup' | 'settings';

export function SPARouter() {
  const { data: session, status } = useSession();
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const { language } = useLanguage();

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
    return <SettingsPage onNavigate={navigateTo} language={language} />;
  }

  // Render main app (home)
  return (
    <AuthGuard>
      <ChatInterface userId={session?.user?.id || ''} voiceLanguage={language} />
    </AuthGuard>
  );
}
