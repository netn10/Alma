'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
  isRTL?: boolean;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
];

export function LanguageSelector({ selectedLanguage, onLanguageChange, className = '', isRTL = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200`}
        title="Select voice language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{selectedLang.flag}</span>
        <span className="hidden sm:inline">{selectedLang.name}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`absolute top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20 min-w-[160px] ${isRTL ? 'right-0' : 'left-0'}`}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onLanguageChange(language.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  selectedLanguage === language.code
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {selectedLanguage === language.code && (
                  <span className={`text-primary dark:text-primary ${isRTL ? 'mr-auto' : 'ml-auto'}`}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
