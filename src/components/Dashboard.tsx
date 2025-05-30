import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Globe, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  ChevronLeft,
  Zap,
  ArrowRight,
  Search,
  User
} from 'lucide-react';
import DashboardHome from './dashboard/DashboardHome';
import NewTransformation from './dashboard/NewTransformation';
import MySites from './dashboard/MySites';
import Analytics from './dashboard/Analytics';
import DashboardSettings from './dashboard/DashboardSettings';
import Help from './dashboard/Help';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '' },
  { icon: PlusCircle, label: 'New Transformation', path: 'new' },
  { icon: Globe, label: 'My Sites', path: 'sites' },
  { icon: BarChart3, label: 'Analytics', path: 'analytics' },
  { icon: Settings, label: 'Settings', path: 'settings' },
  { icon: HelpCircle, label: 'Help', path: 'help' },
];

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  return (
    <div className="min-h-screen bg-[#1A1A1D] text-white flex font-body">
      {/* Sidebar */}
      <aside 
        className={`bg-gray-900 h-screen transition-all duration-300 flex flex-col shadow-xl ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/5 bg-gradient-to-r from-purple-800/30 to-indigo-800/30">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-white" />
            {!isSidebarCollapsed && (
              <span className="font-display font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">LuminaWeb</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-all ${
                currentPath === item.path
                  ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white shadow-md'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 ${currentPath === item.path ? 'text-purple-400' : ''}`} />
              {!isSidebarCollapsed && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
              {!isSidebarCollapsed && currentPath === item.path && (
                <div className="ml-auto h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* User profile */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-white/5 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Alex Johnson</p>
              <p className="text-xs text-gray-400 truncate">alex@example.com</p>
            </div>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-4 border-t border-white/5 flex items-center justify-center hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className={`h-5 w-5 transition-transform ${
            isSidebarCollapsed ? 'rotate-180' : ''
          }`} />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="h-14 border-b border-white/5 bg-gray-900/80 backdrop-blur-lg sticky top-0 z-10 flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-medium">
              {currentPath === '' ? 'Dashboard' :
               currentPath === 'new' ? 'New Transformation' :
               currentPath === 'sites' ? 'My Sites' :
               currentPath === 'analytics' ? 'Analytics' :
               currentPath === 'settings' ? 'Settings' :
               currentPath === 'help' ? 'Help' : 'Dashboard'}
            </h2>
          </div>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm w-64"
            />
          </div>
        </div>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/new" element={<NewTransformation />} />
          <Route path="/sites" element={<MySites />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<DashboardSettings />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;