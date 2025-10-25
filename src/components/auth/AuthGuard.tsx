'use client';

import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { AlmaLogo } from '@/components/ui/AlmaLogo';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4">
            <AlmaLogo size={64} />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary dark:text-primary" />
            <span className="text-gray-600 dark:text-gray-400">Loading Alma...</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // SPA router will handle showing sign in page
  }

  return <>{children}</>;
}
