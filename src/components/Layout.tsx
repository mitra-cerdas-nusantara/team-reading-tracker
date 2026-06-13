import React, { useState } from 'react';
import { BookOpen, BarChart3, Settings as SettingsIcon, ChevronLeft, ChevronRight, Menu, X, Sun, Moon, Shield, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { SuperadminModal } from './SuperadminModal';


interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings?: any;
  superadmin: boolean;
  onSuperadminToggle: (value: boolean) => void;
}

export function Layout({ children, activeTab, setActiveTab, settings, superadmin, onSuperadminToggle }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'log', label: 'Catat Aktivitas', icon: BookOpen },
    ...(superadmin ? [{ id: 'settings', label: 'Pengaturan', icon: SettingsIcon }] : []),
  ];

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [showSuperadminModal, setShowSuperadminModal] = useState<boolean>(false);
  const title = settings?.activity_name || 'Reading Tracker';


  return (
    <div className={cn("min-h-screen", darkMode ? "bg-gray-900" : "bg-gray-50")}>
      {/* Mobile Header */}
      <header className={cn("sm:hidden fixed top-0 left-0 right-0 z-30 border-b h-16", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
        <div className="px-4 h-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={cn("p-2 rounded-lg", darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100")}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className={cn("text-xl font-bold truncate", darkMode ? "text-white" : "text-gray-900")}>{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => superadmin ? onSuperadminToggle(false) : setShowSuperadminModal(true)}
              className={cn("p-2 rounded-lg transition-colors", superadmin ? "text-blue-600 bg-blue-50" : darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100")}
              aria-label={superadmin ? "Deactivate superadmin" : "Activate superadmin"}
              title={superadmin ? "Nonaktifkan superadmin" : "Aktifkan superadmin"}
            >
              {superadmin ? <Shield className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={cn("p-2 rounded-lg transition-colors", darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100")}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {showMobileMenu && (
          <div className={cn("px-4 pb-4 border-t", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setShowMobileMenu(false); }}
                    className={cn(
                      "flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className={cn("hidden sm:flex items-center justify-between px-8 h-16 fixed top-0 left-0 right-0 z-30 border-b", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className={cn("text-xl font-bold", darkMode ? "text-white" : "text-gray-900")}>{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => superadmin ? onSuperadminToggle(false) : setShowSuperadminModal(true)}
            className={cn("p-2 rounded-lg transition-colors", superadmin ? "text-blue-600 bg-blue-50" : darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100")}
            aria-label={superadmin ? "Deactivate superadmin" : "Activate superadmin"}
            title={superadmin ? "Nonaktifkan superadmin" : "Aktifkan superadmin"}
          >
            {superadmin ? <Shield className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={cn("p-2 rounded-lg transition-colors", darkMode ? "text-yellow-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100")}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden sm:flex flex-col fixed top-16 bottom-0 left-0 z-20 transition-[width] duration-200",
          darkMode ? "bg-gray-800 border-r border-gray-700" : "bg-white border-r border-gray-200",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("p-4 border-b flex items-center justify-center", darkMode ? "border-gray-700" : "border-gray-100")}>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Minimize'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
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
                  "flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "gap-3",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "p-4 sm:p-8 pt-20 sm:pt-20 pb-16 sm:pb-0 max-w-5xl mx-auto w-full transition-[margin-left] duration-200",
          collapsed ? "sm:ml-20" : "sm:ml-64",
          darkMode ? "text-white" : "text-gray-900"
        )}
      >
        {children}
      </main>


      {/* Mobile Navigation */}
      <nav className={cn("sm:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 pb-safe z-20 border-t", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive
                  ? "text-blue-600"
                  : darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <SuperadminModal
        open={showSuperadminModal}
        onClose={() => setShowSuperadminModal(false)}
        onSuccess={() => onSuperadminToggle(true)}
      />
    </div>
  );
}
