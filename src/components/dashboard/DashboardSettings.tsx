import React, { useState } from 'react';
import { Save } from 'lucide-react';

const DashboardSettings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: true,
    autoSave: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle settings update
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold mb-6">Settings</h2>
      
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold mb-1">Notifications</h3>
              <p className="text-sm text-gray-400">Receive alerts about your website transformations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Email Updates */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <h3 className="font-display font-bold mb-1">Email Updates</h3>
              <p className="text-sm text-gray-400">Receive weekly reports and tips</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailUpdates}
                onChange={(e) => setSettings({...settings, emailUpdates: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <h3 className="font-display font-bold mb-1">Dark Mode</h3>
              <p className="text-sm text-gray-400">Use dark theme across dashboard</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Auto-Save */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <h3 className="font-display font-bold mb-1">Auto-Save</h3>
              <p className="text-sm text-gray-400">Automatically save changes while editing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary mt-6 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default DashboardSettings;