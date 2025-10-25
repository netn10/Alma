'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { User, Bell, Brain, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Switch } from '@/components/Switch';
import { Input } from '@/components/Input';

interface SettingsPageProps {
  onNavigate: (route: 'home' | 'signin' | 'signup' | 'settings') => void;
  language?: string;
}

interface UserSettings {
  name: string;
  email: string;
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface AlmaSettings {
  responseStyle: 'calm' | 'direct' | 'gentle';
  memoryRetention: 'session' | 'temporary' | 'persistent';
  maxContextLength: number;
  enableSuggestions: boolean;
  enablePrivateMode: boolean;
  voiceLanguage: 'en' | 'he';
  toneRules: {
    [key: string]: boolean;
  };
}

interface PrivacySettings {
  dataRetention: 'session' | 'week' | 'month';
  analyticsEnabled: boolean;
  shareAnonymousUsage: boolean;
}

export function SettingsPage({ onNavigate, language = 'en' }: SettingsPageProps) {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'settings': {
        en: 'Settings',
        he: 'הגדרות'
      },
      'profile': {
        en: 'Profile',
        he: 'פרופיל'
      },
      'alma': {
        en: 'Alma',
        he: 'אלמה'
      },
      'privacy': {
        en: 'Privacy',
        he: 'פרטיות'
      },
      'notifications': {
        en: 'Notifications',
        he: 'התראות'
      },
      'appearance': {
        en: 'Appearance',
        he: 'מראה'
      },
      'profileSettings': {
        en: 'Profile Settings',
        he: 'הגדרות פרופיל'
      },
      'displayName': {
        en: 'Display Name',
        he: 'שם תצוגה'
      },
      'emailAddress': {
        en: 'Email Address',
        he: 'כתובת אימייל'
      },
      'emailCannotBeChanged': {
        en: 'Email cannot be changed. Contact support if needed.',
        he: 'לא ניתן לשנות את האימייל. פנה לתמיכה במידת הצורך.'
      },
      'saveProfile': {
        en: 'Save Profile',
        he: 'שמור פרופיל'
      },
      'saving': {
        en: 'Saving...',
        he: 'שומר...'
      },
      'almaBehavior': {
        en: 'Alma Behavior',
        he: 'התנהגות אלמה'
      },
      'responseStyle': {
        en: 'Response Style',
        he: 'סגנון תגובה'
      },
      'calm': {
        en: 'Calm - Thoughtful and measured',
        he: 'רגוע - מחשבה ומדוד'
      },
      'direct': {
        en: 'Direct - Clear and straightforward',
        he: 'ישיר - ברור ופשוט'
      },
      'gentle': {
        en: 'Gentle - Soft and supportive',
        he: 'עדין - רך ותומך'
      },
      'memoryRetention': {
        en: 'Memory Retention',
        he: 'שמירת זיכרון'
      },
      'sessionOnly': {
        en: 'Session Only - Reset each time',
        he: 'למשך הפעלה בלבד - איפוס בכל פעם'
      },
      'temporary': {
        en: 'Temporary - Keep for a few days',
        he: 'זמני - שמור למשך כמה ימים'
      },
      'persistent': {
        en: 'Persistent - Remember long-term',
        he: 'קבוע - זכור לטווח ארוך'
      },
      'maxContextLength': {
        en: 'Max Context Length',
        he: 'אורך הקשר מקסימלי'
      },
      'contextLengthDescription': {
        en: 'Number of previous messages to remember in context',
        he: 'מספר הודעות קודמות לזכור בהקשר'
      },
      'features': {
        en: 'Features',
        he: 'תכונות'
      },
      'enableSuggestions': {
        en: 'Enable Suggestions',
        he: 'הפעל הצעות'
      },
      'suggestionsDescription': {
        en: 'Show conversation suggestions and prompts',
        he: 'הצג הצעות שיחה ופרומפטים'
      },
      'privateMode': {
        en: 'Private Mode',
        he: 'מצב פרטי'
      },
      'privateModeDescription': {
        en: 'Allow conversations without saving to memory',
        he: 'אפשר שיחות ללא שמירה בזיכרון'
      },
      'voiceLanguage': {
        en: 'Voice Language',
        he: 'שפת קול'
      },
      'voiceLanguageDescription': {
        en: 'Language for voice input and output',
        he: 'שפה לקלט ופלט קולי'
      },
      'toneRules': {
        en: 'Tone Rules',
        he: 'כללי טון'
      },
      'clarity': {
        en: 'clarity',
        he: 'בהירות'
      },
      'clarityDescription': {
        en: 'Use clear, plain language',
        he: 'השתמש בשפה ברורה ופשוטה'
      },
      'care': {
        en: 'care',
        he: 'אכפתיות'
      },
      'careDescription': {
        en: 'Show genuine care and emotional intelligence',
        he: 'הראה אכפתיות אמיתית ואינטליגנציה רגשית'
      },
      'integrity': {
        en: 'integrity',
        he: 'יושרה'
      },
      'integrityDescription': {
        en: 'Maintain honesty and ethical guidance',
        he: 'שמור על יושר והדרכה אתית'
      },
      'humility': {
        en: 'humility',
        he: 'ענווה'
      },
      'humilityDescription': {
        en: 'Acknowledge limitations and uncertainty',
        he: 'הכר במגבלות ובאי וודאות'
      },
      'reflection': {
        en: 'reflection',
        he: 'הרהור'
      },
      'reflectionDescription': {
        en: 'Encourage thoughtful consideration',
        he: 'עודד חשיבה מעמיקה'
      },
      'agency': {
        en: 'agency',
        he: 'סוכנות'
      },
      'agencyDescription': {
        en: 'Empower the user to make decisions',
        he: 'חזק את המשתמש לקבל החלטות'
      },
      'accountability': {
        en: 'accountability',
        he: 'אחריות'
      },
      'accountabilityDescription': {
        en: 'Support responsible action',
        he: 'תמוך בפעולה אחראית'
      },
      'saveAlmaSettings': {
        en: 'Save Alma Settings',
        he: 'שמור הגדרות אלמה'
      },
      'privacySettings': {
        en: 'Privacy Settings',
        he: 'הגדרות פרטיות'
      },
      'dataRetention': {
        en: 'Data Retention',
        he: 'שמירת נתונים'
      },
      'analytics': {
        en: 'Analytics',
        he: 'אנליטיקה'
      },
      'analyticsDescription': {
        en: 'Help improve Alma by sharing usage analytics',
        he: 'עזור לשפר את אלמה על ידי שיתוף אנליטיקת שימוש'
      },
      'anonymousUsageData': {
        en: 'Anonymous Usage Data',
        he: 'נתוני שימוש אנונימיים'
      },
      'anonymousUsageDescription': {
        en: 'Share anonymous usage patterns to improve the service',
        he: 'שתף דפוסי שימוש אנונימיים לשיפור השירות'
      },
      'savePrivacySettings': {
        en: 'Save Privacy Settings',
        he: 'שמור הגדרות פרטיות'
      },
      'notificationPreferences': {
        en: 'Notification Preferences',
        he: 'העדפות התראות'
      },
      'emailNotifications': {
        en: 'Email Notifications',
        he: 'התראות אימייל'
      },
      'emailNotificationsDescription': {
        en: 'Receive updates and important information via email',
        he: 'קבל עדכונים ומידע חשוב דרך אימייל'
      },
      'saveNotificationSettings': {
        en: 'Save Notification Settings',
        he: 'שמור הגדרות התראות'
      },
      'appearance': {
        en: 'Appearance',
        he: 'מראה'
      },
      'theme': {
        en: 'Theme',
        he: 'ערכת נושא'
      },
      'themeDescription': {
        en: 'Choose your preferred color scheme',
        he: 'בחר את ערכת הצבעים המועדפת עליך'
      },
      'themeToggleDescription': {
        en: 'Use the theme toggle above to switch between light and dark modes. Your preference will be saved automatically.',
        he: 'השתמש במתג הערכת הנושא למעלה כדי לעבור בין מצבי אור וחושך. ההעדפה שלך תישמר אוטומטית.'
      },
      'settingsSaved': {
        en: 'Settings saved successfully!',
        he: 'הגדרות נשמרו בהצלחה!'
      },
      'failedToSave': {
        en: 'Failed to save settings',
        he: 'נכשל בשמירת הגדרות'
      },
      'errorSaving': {
        en: 'Error saving settings',
        he: 'שגיאה בשמירת הגדרות'
      }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  // Settings state
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    emailNotifications: true,
    theme: 'system'
  });

  const [almaSettings, setAlmaSettings] = useState<AlmaSettings>({
    responseStyle: 'calm',
    memoryRetention: 'session',
    maxContextLength: 10,
    enableSuggestions: true,
    enablePrivateMode: true,
    voiceLanguage: 'en',
    toneRules: {
      clarity: true,
      care: true,
      integrity: true,
      humility: true,
      reflection: true,
      agency: true,
      accountability: true
    }
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataRetention: 'session',
    analyticsEnabled: false,
    shareAnonymousUsage: false
  });

  useEffect(() => {
    if (session?.user) {
      setUserSettings(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || ''
      }));
      
      // Load existing preferences
      loadUserPreferences();
    }
  }, [session]);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          // Load Alma settings if they exist
          if (data.preferences.alma) {
            setAlmaSettings(prev => ({ ...prev, ...data.preferences.alma }));
          }
          // Load privacy settings if they exist
          if (data.preferences.privacy) {
            setPrivacySettings(prev => ({ ...prev, ...data.preferences.privacy }));
          }
          // Load user settings if they exist
          if (data.preferences.user) {
            setUserSettings(prev => ({ ...prev, ...data.preferences.user }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true);
    setSaveMessage('');
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          settings: section === 'user' ? userSettings : 
                   section === 'alma' ? almaSettings : 
                   privacySettings
        }),
      });

      if (response.ok) {
        setSaveMessage(t('settingsSaved'));
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(t('failedToSave'));
      }
    } catch (error) {
      setSaveMessage(t('errorSaving'));
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'alma', label: t('alma'), icon: Brain },
    { id: 'privacy', label: t('privacy'), icon: Shield },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'appearance', label: t('appearance'), icon: Palette },
  ];

  return (
    <AuthGuard>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${language === 'he' ? 'rtl' : 'ltr'}`} dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`flex flex-col gap-8 ${language === 'he' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:translate-x-1 active:scale-95 ${
                        activeTab === tab.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${language === 'he' ? 'ml-3' : 'mr-3'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {saveMessage && (
                <div className={`mb-4 p-3 rounded-md ${
                  saveMessage.includes('successfully') 
                    ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300' 
                    : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                }`}>
                  {saveMessage}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('profileSettings')}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                        {t('displayName')}
                      </label>
                      <Input
                        value={userSettings.name}
                        onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('displayName')}
                        className={language === 'he' ? 'text-right' : 'text-left'}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                        {t('emailAddress')}
                      </label>
                      <Input
                        value={userSettings.email}
                        onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        disabled
                        className={language === 'he' ? 'text-right' : 'text-left'}
                      />
                      <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                        {t('emailCannotBeChanged')}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSaveSettings('user')}
                      disabled={isLoading}
                      className="mt-4"
                    >
                      {isLoading ? t('saving') : t('saveProfile')}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Alma Tab */}
              {activeTab === 'alma' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('almaBehavior')}</h2>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                          {t('responseStyle')}
                        </label>
                        <select
                          value={almaSettings.responseStyle}
                          onChange={(e) => setAlmaSettings(prev => ({ 
                            ...prev, 
                            responseStyle: e.target.value as 'calm' | 'direct' | 'gentle' 
                          }))}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${language === 'he' ? 'text-right' : 'text-left'}`}
                        >
                          <option value="calm">{t('calm')}</option>
                          <option value="direct">{t('direct')}</option>
                          <option value="gentle">{t('gentle')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                          {t('memoryRetention')}
                        </label>
                        <select
                          value={almaSettings.memoryRetention}
                          onChange={(e) => setAlmaSettings(prev => ({ 
                            ...prev, 
                            memoryRetention: e.target.value as 'session' | 'temporary' | 'persistent' 
                          }))}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${language === 'he' ? 'text-right' : 'text-left'}`}
                        >
                          <option value="session">{t('sessionOnly')}</option>
                          <option value="temporary">{t('temporary')}</option>
                          <option value="persistent">{t('persistent')}</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                          {t('maxContextLength')}: {almaSettings.maxContextLength}
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="20"
                          value={almaSettings.maxContextLength}
                          onChange={(e) => setAlmaSettings(prev => ({ 
                            ...prev, 
                            maxContextLength: parseInt(e.target.value) 
                          }))}
                          className="w-full"
                        />
                        <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                          {t('contextLengthDescription')}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('features')}</h2>
                    <div className="space-y-4">
                      <div className={`flex items-center justify-between ${language === 'he' ? 'flex-row-reverse' : ''}`}>
                        {language === 'he' ? (
                          <>
                            <Switch
                              checked={almaSettings.enableSuggestions}
                              onChange={(checked) => setAlmaSettings(prev => ({ ...prev, enableSuggestions: checked }))}
                              isRTL={language === 'he'}
                            />
                            <div className="text-right">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('enableSuggestions')}
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('suggestionsDescription')}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-left">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('enableSuggestions')}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('suggestionsDescription')}
                          </p>
                        </div>
                        <Switch
                          checked={almaSettings.enableSuggestions}
                          onChange={(checked) => setAlmaSettings(prev => ({ ...prev, enableSuggestions: checked }))}
                              isRTL={language === 'he'}
                        />
                          </>
                        )}
                      </div>
                      <div className={`flex items-center justify-between ${language === 'he' ? 'flex-row-reverse' : ''}`}>
                        {language === 'he' ? (
                          <>
                            <Switch
                              checked={almaSettings.enablePrivateMode}
                              onChange={(checked) => setAlmaSettings(prev => ({ ...prev, enablePrivateMode: checked }))}
                              isRTL={language === 'he'}
                            />
                            <div className="text-right">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('privateMode')}
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('privateModeDescription')}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-left">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('privateMode')}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('privateModeDescription')}
                          </p>
                        </div>
                        <Switch
                          checked={almaSettings.enablePrivateMode}
                          onChange={(checked) => setAlmaSettings(prev => ({ ...prev, enablePrivateMode: checked }))}
                              isRTL={language === 'he'}
                        />
                          </>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                          {t('voiceLanguage')}
                        </label>
                        <select
                          value={almaSettings.voiceLanguage}
                          onChange={(e) => setAlmaSettings(prev => ({ 
                            ...prev, 
                            voiceLanguage: e.target.value as 'en' | 'he' 
                          }))}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${language === 'he' ? 'text-right' : 'text-left'}`}
                        >
                          <option value="en">🇺🇸 English</option>
                          <option value="he">🇮🇱 עברית (Hebrew)</option>
                        </select>
                        <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                          {t('voiceLanguageDescription')}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('toneRules')}</h2>
                    <div className="space-y-3">
                      {Object.entries(almaSettings.toneRules).map(([rule, enabled]) => (
                        <div key={rule} className={`flex items-center justify-between ${language === 'he' ? 'flex-row-reverse' : ''}`}>
                          {language === 'he' ? (
                            <>
                              <Switch
                                checked={enabled}
                                onChange={(checked) => setAlmaSettings(prev => ({ 
                                  ...prev, 
                                  toneRules: { ...prev.toneRules, [rule]: checked }
                                }))}
                                isRTL={language === 'he'}
                              />
                              <div className="text-right">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                  {t(rule)}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {rule === 'clarity' && t('clarityDescription')}
                                  {rule === 'care' && t('careDescription')}
                                  {rule === 'integrity' && t('integrityDescription')}
                                  {rule === 'humility' && t('humilityDescription')}
                                  {rule === 'reflection' && t('reflectionDescription')}
                                  {rule === 'agency' && t('agencyDescription')}
                                  {rule === 'accountability' && t('accountabilityDescription')}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-left">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {t(rule)}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {rule === 'clarity' && t('clarityDescription')}
                              {rule === 'care' && t('careDescription')}
                              {rule === 'integrity' && t('integrityDescription')}
                              {rule === 'humility' && t('humilityDescription')}
                              {rule === 'reflection' && t('reflectionDescription')}
                              {rule === 'agency' && t('agencyDescription')}
                              {rule === 'accountability' && t('accountabilityDescription')}
                            </p>
                          </div>
                          <Switch
                            checked={enabled}
                            onChange={(checked) => setAlmaSettings(prev => ({ 
                              ...prev, 
                              toneRules: { ...prev.toneRules, [rule]: checked }
                            }))}
                                isRTL={language === 'he'}
                          />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Button
                    onClick={() => handleSaveSettings('alma')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? t('saving') : t('saveAlmaSettings')}
                  </Button>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('privacySettings')}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                        {t('dataRetention')}
                      </label>
                      <select
                        value={privacySettings.dataRetention}
                        onChange={(e) => setPrivacySettings(prev => ({ 
                          ...prev, 
                          dataRetention: e.target.value as 'session' | 'week' | 'month' 
                        }))}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${language === 'he' ? 'text-right' : 'text-left'}`}
                      >
                        <option value="session">{t('sessionOnly')}</option>
                        <option value="week">1 {language === 'he' ? 'שבוע' : 'Week'}</option>
                        <option value="month">1 {language === 'he' ? 'חודש' : 'Month'}</option>
                      </select>
                    </div>
                    <div className={`flex items-center justify-between ${language === 'he' ? 'flex-row-reverse' : ''}`}>
                      {language === 'he' ? (
                        <>
                          <Switch
                            checked={privacySettings.analyticsEnabled}
                            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, analyticsEnabled: checked }))}
                            isRTL={language === 'he'}
                          />
                          <div className="text-right">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('analytics')}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('analyticsDescription')}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-left">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('analytics')}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('analyticsDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.analyticsEnabled}
                        onChange={(checked) => setPrivacySettings(prev => ({ ...prev, analyticsEnabled: checked }))}
                            isRTL={language === 'he'}
                      />
                        </>
                      )}
                    </div>
                    <div className={`flex items-center justify-between ${language === 'he' ? 'flex-row-reverse' : ''}`}>
                      {language === 'he' ? (
                        <>
                          <Switch
                            checked={privacySettings.shareAnonymousUsage}
                            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, shareAnonymousUsage: checked }))}
                            isRTL={language === 'he'}
                          />
                          <div className="text-right">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('anonymousUsageData')}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('anonymousUsageDescription')}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-left">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('anonymousUsageData')}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('anonymousUsageDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.shareAnonymousUsage}
                        onChange={(checked) => setPrivacySettings(prev => ({ ...prev, shareAnonymousUsage: checked }))}
                            isRTL={language === 'he'}
                      />
                        </>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSaveSettings('privacy')}
                      disabled={isLoading}
                      className="mt-4"
                    >
                      {isLoading ? t('saving') : t('savePrivacySettings')}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('notificationPreferences')}</h2>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between ${language === 'he' ? 'flex-row-reverse' : ''}`}>
                      {language === 'he' ? (
                        <>
                          <Switch
                            checked={userSettings.emailNotifications}
                            onChange={(checked) => setUserSettings(prev => ({ ...prev, emailNotifications: checked }))}
                            isRTL={language === 'he'}
                          />
                          <div className="text-right">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('emailNotifications')}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('emailNotificationsDescription')}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-left">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('emailNotifications')}
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('emailNotificationsDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.emailNotifications}
                        onChange={(checked) => setUserSettings(prev => ({ ...prev, emailNotifications: checked }))}
                            isRTL={language === 'he'}
                      />
                        </>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSaveSettings('user')}
                      disabled={isLoading}
                      className="mt-4"
                    >
                      {isLoading ? t('saving') : t('saveNotificationSettings')}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('appearance')}</h2>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between ${language === 'he' ? 'flex-row-reverse' : ''}`}>
                      {language === 'he' ? (
                        <>
                          <ThemeToggle />
                          <div className="text-right">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('theme')}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('themeDescription')}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-left">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('theme')}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('themeDescription')}
                            </p>
                          </div>
                          <ThemeToggle />
                        </>
                      )}
                    </div>
                    <p className={`text-sm text-gray-600 dark:text-gray-400 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                      {t('themeToggleDescription')}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
