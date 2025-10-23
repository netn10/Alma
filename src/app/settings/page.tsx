'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { User, Bell, Brain, Shield, Palette, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Switch } from '@/components/Switch';
import { Input } from '@/components/Input';
import Link from 'next/link';

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
  toneRules: {
    [key: string]: boolean;
  };
}

interface PrivacySettings {
  dataRetention: 'session' | 'week' | 'month';
  analyticsEnabled: boolean;
  shareAnonymousUsage: boolean;
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Failed to save settings');
      }
    } catch (error) {
      setSaveMessage('Error saving settings');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'alma', label: 'Alma', icon: Brain },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:translate-x-[-4px]">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Alma
                </Link>
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
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
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
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
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display Name
                      </label>
                      <Input
                        value={userSettings.name}
                        onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your display name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <Input
                        value={userSettings.email}
                        onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        disabled
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSaveSettings('user')}
                      disabled={isLoading}
                      className="mt-4"
                    >
                      {isLoading ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Alma Tab */}
              {activeTab === 'alma' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Alma Behavior</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Response Style
                        </label>
                        <select
                          value={almaSettings.responseStyle}
                          onChange={(e) => setAlmaSettings(prev => ({ 
                            ...prev, 
                            responseStyle: e.target.value as 'calm' | 'direct' | 'gentle' 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="calm">Calm - Thoughtful and measured</option>
                          <option value="direct">Direct - Clear and straightforward</option>
                          <option value="gentle">Gentle - Soft and supportive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Memory Retention
                        </label>
                        <select
                          value={almaSettings.memoryRetention}
                          onChange={(e) => setAlmaSettings(prev => ({ 
                            ...prev, 
                            memoryRetention: e.target.value as 'session' | 'temporary' | 'persistent' 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="session">Session Only - Reset each time</option>
                          <option value="temporary">Temporary - Keep for a few days</option>
                          <option value="persistent">Persistent - Remember long-term</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Context Length: {almaSettings.maxContextLength}
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Number of previous messages to remember in context
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Features</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Enable Suggestions
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Show conversation suggestions and prompts
                          </p>
                        </div>
                        <Switch
                          checked={almaSettings.enableSuggestions}
                          onChange={(checked) => setAlmaSettings(prev => ({ ...prev, enableSuggestions: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Private Mode
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Allow conversations without saving to memory
                          </p>
                        </div>
                        <Switch
                          checked={almaSettings.enablePrivateMode}
                          onChange={(checked) => setAlmaSettings(prev => ({ ...prev, enablePrivateMode: checked }))}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Tone Rules</h2>
                    <div className="space-y-3">
                      {Object.entries(almaSettings.toneRules).map(([rule, enabled]) => (
                        <div key={rule} className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {rule}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {rule === 'clarity' && 'Use clear, plain language'}
                              {rule === 'care' && 'Show genuine care and emotional intelligence'}
                              {rule === 'integrity' && 'Maintain honesty and ethical guidance'}
                              {rule === 'humility' && 'Acknowledge limitations and uncertainty'}
                              {rule === 'reflection' && 'Encourage thoughtful consideration'}
                              {rule === 'agency' && 'Empower the user to make decisions'}
                              {rule === 'accountability' && 'Support responsible action'}
                            </p>
                          </div>
                          <Switch
                            checked={enabled}
                            onChange={(checked) => setAlmaSettings(prev => ({ 
                              ...prev, 
                              toneRules: { ...prev.toneRules, [rule]: checked }
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Button
                    onClick={() => handleSaveSettings('alma')}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Saving...' : 'Save Alma Settings'}
                  </Button>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Privacy Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Data Retention
                      </label>
                      <select
                        value={privacySettings.dataRetention}
                        onChange={(e) => setPrivacySettings(prev => ({ 
                          ...prev, 
                          dataRetention: e.target.value as 'session' | 'week' | 'month' 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="session">Session Only</option>
                        <option value="week">1 Week</option>
                        <option value="month">1 Month</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Analytics
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Help improve Alma by sharing usage analytics
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.analyticsEnabled}
                        onChange={(checked) => setPrivacySettings(prev => ({ ...prev, analyticsEnabled: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Anonymous Usage Data
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Share anonymous usage patterns to improve the service
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.shareAnonymousUsage}
                        onChange={(checked) => setPrivacySettings(prev => ({ ...prev, shareAnonymousUsage: checked }))}
                      />
                    </div>
                    <Button
                      onClick={() => handleSaveSettings('privacy')}
                      disabled={isLoading}
                      className="mt-4"
                    >
                      {isLoading ? 'Saving...' : 'Save Privacy Settings'}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Notifications
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Receive updates and important information via email
                        </p>
                      </div>
                      <Switch
                        checked={userSettings.emailNotifications}
                        onChange={(checked) => setUserSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                    <Button
                      onClick={() => handleSaveSettings('user')}
                      disabled={isLoading}
                      className="mt-4"
                    >
                      {isLoading ? 'Saving...' : 'Save Notification Settings'}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Appearance</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Theme
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Choose your preferred color scheme
                        </p>
                      </div>
                      <ThemeToggle />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use the theme toggle above to switch between light and dark modes. 
                      Your preference will be saved automatically.
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
