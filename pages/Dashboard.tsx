import React, { useState } from 'react';
import { Route, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { UserRole, PlanType } from '../types';
import { useApp } from '../context/AppContext';
import { Bell, LogOut, Menu, X, Plus, Shield, Users, LayoutDashboard, Settings as SettingsIcon, Check, Trash2, Info } from 'lucide-react';
import { Button } from '../components/UI';
import Generator from './Generator';
import VideoLibrary from './VideoLibrary';
import Analytics from './Analytics';
import Billing from './Billing';
import Settings from './Settings';
import AdminDashboard from './admin/AdminDashboard';
import UsersPage from './admin/Users';
import SystemSettings from './admin/SystemSettings';

const DashboardHome: React.FC = () => {
  const { user, userVideos } = useApp();
  
  if (!user) return null;

  return (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="glass-panel rounded-xl p-6">
        <p className="text-sm text-neutral-400">Credits Remaining</p>
        <h3 className="text-3xl font-bold mt-2">{user.credits}</h3>
        <p className="text-xs text-neutral-500 mt-1">Resets monthly</p>
      </div>
      <div className="glass-panel rounded-xl p-6">
        <p className="text-sm text-neutral-400">Videos Generated</p>
        <h3 className="text-3xl font-bold mt-2">{userVideos.length}</h3>
        <p className="text-xs text-green-500 mt-1">All time</p>
      </div>
      <div className="glass-panel rounded-xl p-6">
        <p className="text-sm text-neutral-400">Storage Used</p>
        <h3 className="text-3xl font-bold mt-2">{userVideos.length * 5} MB</h3>
        <p className="text-xs text-neutral-500 mt-1">Estimated</p>
      </div>
      <div className="glass-panel rounded-xl p-6 bg-gradient-to-br from-neutral-900 to-black border-neutral-800">
        <p className="text-sm text-neutral-400">Current Plan</p>
        <div className="flex justify-between items-end mt-2">
          <h3 className="text-3xl font-bold">{user.plan}</h3>
          <Link to="/billing">
             <Button variant="ghost" className="text-xs h-8 px-2">Manage</Button>
          </Link>
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Recent Creations</h2>
      <Link to="/videos">
        <Button variant="ghost">View All</Button>
      </Link>
    </div>

    {userVideos.length === 0 ? (
      <div className="text-center py-12 glass-panel rounded-xl border-dashed">
         <p className="text-neutral-500 mb-4">No videos generated yet.</p>
         <Link to="/generate"><Button>Create First Video</Button></Link>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userVideos.slice(0, 3).map((video) => (
          <Link key={video.id} to={`/videos/${video.id}`}>
            <div className="glass-panel rounded-xl overflow-hidden group hover:border-white/20 transition-all cursor-pointer">
              <div className="aspect-video bg-neutral-900 relative">
                 {video.url && video.url !== '#' ? (
                   <video src={video.url} className="w-full h-full object-cover" />
                 ) : (
                   <img src={`https://picsum.photos/seed/${video.id}/400/225`} alt="Video thumbnail" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                 )}
              </div>
              <div className="p-4">
                <h4 className="font-medium truncate">{video.prompt}</h4>
                <div className="flex justify-between mt-2 text-xs text-neutral-500">
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  <span>{video.aspectRatio}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
  );
};

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout, notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useApp();

  if (!user) return <Navigate to="/auth/login" />;

  const isAdmin = user.role === UserRole.ADMIN;
  const unreadCount = notifications.filter(n => !n.read).length;

  const adminNavItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'System Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  const currentNavItems = isAdmin ? adminNavItems : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Notification Backdrop Overlay */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-30 bg-transparent"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-black border-r border-white/10 z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-white to-neutral-500"></div>
            <span className="font-bold text-lg tracking-tight">VideoGen AI</span>
            {isAdmin && <span className="text-xs bg-red-500 text-white px-1.5 rounded">ADMIN</span>}
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-1">
          {!isAdmin && (
            <Link to="/generate">
              <Button className="w-full justify-start mb-6 gap-2" variant="primary">
                <Plus size={18} /> New Video
              </Button>
            </Link>
          )}

          {currentNavItems.map((item) => {
             const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
             return (
              <Link 
                key={item.label} 
                to={item.path} 
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
             );
          })}
        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
           <div className="flex items-center space-x-3 mb-4 px-2">
             <img src={user.avatarUrl} alt="User" className="w-8 h-8 rounded-full border border-white/20" />
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium truncate">{user.name}</p>
               <p className="text-xs text-neutral-500 truncate">{user.email}</p>
             </div>
           </div>
           <button onClick={logout} className="flex items-center space-x-3 px-4 py-2 w-full text-left text-sm text-neutral-400 hover:text-white transition-colors">
             <LogOut size={16} />
             <span>Sign out</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-neutral-400">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto relative">
             <div className="relative">
                 <Button 
                    variant="ghost" 
                    className="relative p-2 rounded-full"
                    onClick={() => setShowNotifications(!showNotifications)}
                 >
                   <Bell size={20} />
                   {unreadCount > 0 && (
                     <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                   )}
                 </Button>

                 {/* Notifications Dropdown */}
                 {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 origin-top-right ring-1 ring-black/50">
                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button 
                                      onClick={markAllNotificationsRead} 
                                      className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-white/5" 
                                      title="Mark all as read"
                                    >
                                        <Check size={12} /> Mark all read
                                    </button>
                                )}
                                <button 
                                  onClick={clearNotifications} 
                                  className="text-xs flex items-center gap-1 text-neutral-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5" 
                                  title="Clear all"
                                >
                                    <Trash2 size={12} /> Clear
                                </button>
                            </div>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-neutral-500 gap-2">
                                    <Bell size={24} className="opacity-20" />
                                    <span className="text-sm">No new notifications</span>
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => markNotificationRead(n.id)}
                                        className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors group relative ${!n.read ? 'bg-blue-500/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 transition-colors ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm mb-0.5 truncate ${!n.read ? 'font-semibold text-white' : 'font-medium text-neutral-400'}`}>{n.title}</h4>
                                                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{n.message}</p>
                                                <p className="text-[10px] text-neutral-600 mt-2 flex items-center gap-1">
                                                  {new Date(n.createdAt).toLocaleDateString()} 
                                                  <span className="w-0.5 h-0.5 bg-neutral-600 rounded-full"></span> 
                                                  {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                 )}
             </div>

             {user.plan === 'Free' && !isAdmin && (
               <Link to="/billing">
                 <Button variant="secondary" className="text-xs hidden sm:flex">
                   Upgrade to Pro
                 </Button>
               </Link>
             )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={isAdmin ? <AdminDashboard /> : <DashboardHome />} />
            <Route path="/generate" element={<Generator />} />
            <Route path="/videos" element={<VideoLibrary />} />
            <Route path="/videos/:videoId" element={<VideoLibrary />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/billing" element={<Billing user={user} />} />
            <Route path="/settings" element={<Settings user={user} />} />
            
            {/* Admin Routes */}
            {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
            {isAdmin && <Route path="/admin/users" element={<UsersPage />} />}
            {isAdmin && <Route path="/admin/settings" element={<SystemSettings />} />}
            
            <Route path="*" element={isAdmin ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}