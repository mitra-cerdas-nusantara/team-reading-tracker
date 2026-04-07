import React from 'react';
import { BookOpen, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings?: any;
}

export function Layout({ children, activeTab, setActiveTab, settings }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'log', label: 'Catat Membaca', icon: BookOpen },
    { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
  ];

  const title = settings?.activity_name || 'Reading Tracker';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row">
      {/* Mobile Header */}
      <header className="sm:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 h-16 flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 bottom-0 left-0 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-blue-600 p-2 rounded-lg shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight break-words">{title}</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:ml-64 p-4 sm:p-8 pb-24 sm:pb-8 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-safe z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
