import React from 'react';
import { Moon, Sun, Bell, Save, Book, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useThemeStore } from '../store/useThemeStore';
import { useSettingsStore } from '../store/useSettingsStore';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { settings, updateSettings } = useSettingsStore();
  
  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Theme</h3>
                <p className="text-gray-400">Choose your preferred theme</p>
              </div>
              <Button
                variant="outline"
                onClick={toggleTheme}
                leftIcon={theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              >
                {theme === 'dark' ? 'Dark' : 'Light'} Mode
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Study Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Cards per Study Session
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={settings.cardsPerStudySession}
                onChange={(e) => updateSettings({ 
                  cardsPerStudySession: parseInt(e.target.value) 
                })}
                className="bg-background-tertiary text-white rounded-lg border border-gray-700 py-2 px-4"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="spaceRepetition"
                checked={settings.spaceRepetitionEnabled}
                onChange={(e) => updateSettings({ 
                  spaceRepetitionEnabled: e.target.checked 
                })}
                className="mr-3"
              />
              <div>
                <label htmlFor="spaceRepetition" className="font-medium">
                  Space Repetition
                </label>
                <p className="text-sm text-gray-400">
                  Optimize your learning with spaced repetition algorithm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSave"
                checked={settings.autoSaveEnabled}
                onChange={(e) => updateSettings({ 
                  autoSaveEnabled: e.target.checked 
                })}
                className="mr-3"
              />
              <div>
                <label htmlFor="autoSave" className="font-medium">Auto Save</label>
                <p className="text-sm text-gray-400">
                  Automatically save changes to flashcards
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notificationsEnabled}
                onChange={(e) => updateSettings({ 
                  notificationsEnabled: e.target.checked 
                })}
                className="mr-3"
              />
              <div>
                <label htmlFor="notifications" className="font-medium">
                  Notifications
                </label>
                <p className="text-sm text-gray-400">
                  Receive study reminders and updates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Export Format
              </label>
              <select
                value={settings.exportFormat}
                onChange={(e) => updateSettings({ 
                  exportFormat: e.target.value as any 
                })}
                className="bg-background-tertiary text-white rounded-lg border border-gray-700 py-2 px-4 w-full"
              >
                <option value="json">JSON (FlashCard Masher)</option>
                <option value="csv">CSV</option>
                <option value="anki">Anki</option>
                <option value="quizlet">Quizlet</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};