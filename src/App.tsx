import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LogActivity } from './components/LogActivity';
import { Settings } from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editLogData, setEditLogData] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEditLog = (log: any) => {
    setEditLogData(log);
    setActiveTab('log');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} settings={settings}>
      {activeTab === 'dashboard' && <Dashboard settings={settings} onEditLog={handleEditLog} />}
      {activeTab === 'log' && <LogActivity settings={settings} editLogData={editLogData} clearEdit={() => setEditLogData(null)} />}
      {activeTab === 'settings' && <Settings settings={settings} onSettingsChange={fetchSettings} />}
    </Layout>
  );
}
