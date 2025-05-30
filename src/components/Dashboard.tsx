import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating session IDs for analytics
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
  Search,
  User,
  ExternalLink
} from 'lucide-react';
import DashboardHome from './dashboard/DashboardHome';
import NewTransformation from './dashboard/NewTransformation';
import Analytics from './dashboard/Analytics';
import DashboardSettings from './dashboard/DashboardSettings';
import Help from './dashboard/Help';
import { useUser } from '@clerk/clerk-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client initialization
const supabaseUrlFromEnv = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKeyFromEnv = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (typeof supabaseUrlFromEnv === 'string' && supabaseUrlFromEnv.length > 0 && 
    typeof supabaseAnonKeyFromEnv === 'string' && supabaseAnonKeyFromEnv.length > 0) {
  // Both are confirmed to be non-empty strings here
  const finalSupabaseUrl: string = supabaseUrlFromEnv;
  const finalSupabaseAnonKey: string = supabaseAnonKeyFromEnv;
  supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey);
} else {
  console.error('Supabase URL or anonymous key is missing. Dashboard user info and analytics will not work. Check your .env file.');
}

const SESSION_ID_KEY = 'app_session_id';

// Function to get or create a session ID for analytics
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

interface AnalyticsPageViewEvent {
  event_type: 'page_view';
  user_id?: string;
  path: string;
  session_id: string;
  details?: Record<string, unknown>;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '' },
  { icon: PlusCircle, label: 'New Transformation', path: 'new' },
  { icon: Globe, label: 'My Sites', path: '', externalUrl: 'https://sites.luminaweb.app' },
  { icon: BarChart3, label: 'Analytics', path: 'analytics' },
  { icon: Settings, label: 'Settings', path: 'settings' },
  { icon: HelpCircle, label: 'Help', path: 'help' },
];

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user, isSignedIn, isLoaded: clerkIsLoaded } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const currentPath = location.pathname.split('/').pop();

  useEffect(() => {
    if (!supabase) {
      console.log('Supabase client not initialized for Dashboard. Skipping user profile fetch.');
      return;
    }
    if (clerkIsLoaded && isSignedIn && user && user.id) {
      supabase
        .from('users')
        .select('first_name, last_name, email, avatar_url')
        .eq('clerk_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows
            console.error('Error fetching user profile from Supabase:', error);
            setUserProfile(null); // Clear profile on error
          } else if (data) {
            setUserProfile(data as UserProfile);
          } else {
            // User might not be in DB yet if UserSync hasn't run or failed
            // Fallback to Clerk data if available, or show placeholders
            setUserProfile({
              first_name: user.firstName,
              last_name: user.lastName,
              email: user.primaryEmailAddress?.emailAddress || null,
              avatar_url: user.imageUrl
            });
          }
        });
    } else if (clerkIsLoaded && !isSignedIn) {
      setUserProfile(null); // Clear profile if user signs out
    }
  }, [user, isSignedIn, clerkIsLoaded]);

  // Analytics: Track page views
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not initialized for analytics. Skipping page view tracking.');
      return;
    }
    if (clerkIsLoaded) { // Ensure Clerk is loaded to get correct user state
      const pageViewData: AnalyticsPageViewEvent = {
        event_type: 'page_view',
        path: location.pathname + location.search,
        session_id: getSessionId(),
        user_id: isSignedIn && user ? user.id : undefined,
      };

      // console.log('Tracking page view:', pageViewData);
      supabase.from('analytics_events').insert([pageViewData]).then(({ error }) => {
        if (error) {
          console.error('Error tracking page view:', error);
        }
      });
    }
  }, [location.pathname, location.search, clerkIsLoaded, isSignedIn, user]); // Re-run on path/auth change

  return (
    <div className="h-screen overflow-hidden bg-[#1A1A1D] text-white flex font-body">
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
            item.externalUrl ? (
              <a
                key={item.label}
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center px-4 py-3 mb-1 rounded-lg transition-all text-gray-400 hover:bg-white/5 hover:text-white`}
              >
                <item.icon className="h-5 w-5" />
                {!isSidebarCollapsed && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
                {!isSidebarCollapsed && (
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-500" />
                )}
              </a>
            ) : (
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
            )
          ))}
        </nav>

        {/* User profile */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-white/5 flex items-center gap-3">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="User avatar" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : 'Loading...'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {userProfile?.email || (clerkIsLoaded && !isSignedIn ? 'Not signed in' : 'Loading...')}
              </p>
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
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<DashboardSettings />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;