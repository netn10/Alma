'use client';

import { useTheme } from '@/components/providers/ThemeProvider';
import { Check } from 'lucide-react';

type ColorTheme = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal' | 'red';

interface ColorThemeSelectorProps {
  language?: string;
}

const colorThemes: { value: ColorTheme; name: string; nameHe: string; preview: string }[] = [
  { value: 'blue', name: 'Blue', nameHe: 'כחול', preview: '#3b82f6' },
  { value: 'green', name: 'Green', nameHe: 'ירוק', preview: '#22c55e' },
  { value: 'purple', name: 'Purple', nameHe: 'סגול', preview: '#a855f7' },
  { value: 'orange', name: 'Orange', nameHe: 'כתום', preview: '#f97316' },
  { value: 'pink', name: 'Pink', nameHe: 'ורוד', preview: '#ec4899' },
  { value: 'teal', name: 'Teal', nameHe: 'טורקיז', preview: '#14b8a6' },
  { value: 'red', name: 'Red', nameHe: 'אדום', preview: '#ef4444' },
];

export function ColorThemeSelector({ language = 'en' }: ColorThemeSelectorProps) {
  const { colorTheme, setColorTheme } = useTheme();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'colorTheme': {
        en: 'Color Theme',
        he: 'ערכת צבעים'
      },
      'colorThemeDescription': {
        en: 'Choose your preferred color scheme for the interface',
        he: 'בחר את ערכת הצבעים המועדפת עליך לממשק'
      },
      'default': {
        en: 'Default',
        he: 'ברירת מחדל'
      }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'he' ? 'text-right' : 'text-left'}`}>
          {t('colorTheme')}
        </label>
        <p className={`text-xs text-gray-500 dark:text-gray-400 mb-4 ${language === 'he' ? 'text-right' : 'text-left'}`}>
          {t('colorThemeDescription')}
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {colorThemes.map((theme) => {
          const isSelected = colorTheme === theme.value;
          const isDefault = theme.value === 'blue';
          
          return (
            <button
              key={theme.value}
              onClick={() => setColorTheme(theme.value)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95
                ${isSelected 
                  ? 'border-primary ring-2 ring-primary ring-opacity-20 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${isDefault ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20' : ''}
              `}
            >
              {/* Color Preview */}
              <div 
                className="w-full h-8 rounded-md mb-2 shadow-sm"
                style={{ backgroundColor: theme.preview }}
              />
              
              {/* Theme Name */}
              <div className={`text-sm font-medium ${language === 'he' ? 'text-right' : 'text-left'}`}>
                {language === 'he' ? theme.nameHe : theme.name}
                {isDefault && (
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    ({t('default')})
                  </span>
                )}
              </div>
              
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
