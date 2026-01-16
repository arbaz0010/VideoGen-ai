import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard, Button, Input, Badge } from '../../components/UI';
import { User, PlanType, UserRole } from '../../types';
import { 
  Search, Filter, MoreVertical, Mail, CreditCard, Shield, 
  Trash2, UserCog, Ban, CheckCircle2, Download, ExternalLink, 
  X, Image, HardDrive, Layout, RefreshCw, LogIn
} from 'lucide-react';

export default function UsersPage() {
  const { allUsers, updateUser, deleteUser, impersonateUser, userVideos, activityLogs, addLog } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Selection & Details
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'All' || u.role === filterRole;
      const matchesStatus = filterStatus === 'All' || u.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchTerm, filterRole, filterStatus]);

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(prev => prev.filter(uid => uid !== id));
    } else {
      setSelectedUserIds(prev => [...prev, id]);
    }
  };

  const handleBulkAction = (action: string) => {
    if (action === 'email') {
      alert(`Opening email draft for ${selectedUserIds.length} users`);
    } else if (action === 'export') {
      const data = allUsers.filter(u => selectedUserIds.includes(u.id));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users_export.json';
      a.click();
    } else if (action === 'credits') {
      const amount = prompt("Enter credits to add:");
      if (amount) {
        selectedUserIds.forEach(id => {
          const user = allUsers.find(u => u.id === id);
          if (user) updateUser(id, { credits: user.credits + Number(amount) });
        });
        addLog('Bulk Credits Added', 'success', `${amount} credits to ${selectedUserIds.length} users`);
      }
    }
    setSelectedUserIds([]);
  };

  // Individual Actions
  const handleStatusToggle = (u: User) => {
    const newStatus = u.status === 'active' ? 'banned' : 'active';
    updateUser(u.id, { status: newStatus });
    if (viewingUser && viewingUser.id === u.id) {
       setViewingUser({ ...u, status: newStatus });
    }
  };

  // Render User Details Drawer/Modal
  const renderUserDetail = () => {
    if (!viewingUser) return null;
    
    const userStats = {
       videos: userVideos.filter(v => v.userId === viewingUser.id).length,
       storage: userVideos.filter(v => v.userId === viewingUser.id).length * 5, // Mock 5MB avg
       spent: viewingUser.plan === PlanType.FREE ? 0 : viewingUser.plan === PlanType.PRO ? 29.99 : 7.99,
    };
    
    const userLogs = activityLogs.filter(l => l.userId === viewingUser.id);

    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingUser(null)} />
        <div className="relative w-full max-w-2xl bg-neutral-900 border-l border-white/10 h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
           
           {/* Header */}
           <div className="p-6 border-b border-white/10 flex justify-between items-start bg-neutral-900 sticky top-0 z-10">
              <div className="flex gap-4">
                 <img src={viewingUser.avatarUrl} className="w-16 h-16 rounded-full border border-white/20" />
                 <div>
                    <h2 className="text-xl font-bold">{viewingUser.name}</h2>
                    <p className="text-neutral-400 text-sm">{viewingUser.email}</p>
                    <div className="flex gap-2 mt-2">
                       <Badge>{viewingUser.plan}</Badge>
                       <Badge color={viewingUser.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                          {viewingUser.status.toUpperCase()}
                       </Badge>
                       <Badge color="bg-blue-500/20 text-blue-400">{viewingUser.role}</Badge>
                    </div>
                 </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
           </div>

           <div className="p-6 space-y-8">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 <Button variant="secondary" className="text-xs" onClick={() => handleStatusToggle(viewingUser)}>
                    {viewingUser.status === 'active' ? <Ban size={14} className="mr-2"/> : <CheckCircle2 size={14} className="mr-2"/>}
                    {viewingUser.status === 'active' ? 'Ban User' : 'Unban User'}
                 </Button>
                 <Button variant="secondary" className="text-xs" onClick={() => { updateUser(viewingUser.id, { credits: viewingUser.credits + 100 }); setViewingUser({...viewingUser, credits: viewingUser.credits + 100 })}}>
                    <CreditCard size={14} className="mr-2"/> Add Credits
                 </Button>
                 <Button variant="secondary" className="text-xs" onClick={() => alert("Password reset email sent.")}>
                    <RefreshCw size={14} className="mr-2"/> Reset Pwd
                 </Button>
                 <Button variant="secondary" className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10" onClick={() => impersonateUser(viewingUser)}>
                    <LogIn size={14} className="mr-2"/> Impersonate
                 </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-neutral-400 uppercase">Videos</p>
                    <p className="text-xl font-bold">{userStats.videos}</p>
                 </div>
                 <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-neutral-400 uppercase">Credits</p>
                    <p className="text-xl font-bold">{viewingUser.credits}</p>
                 </div>
                 <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-neutral-400 uppercase">Storage</p>
                    <p className="text-xl font-bold">{userStats.storage} MB</p>
                 </div>
                 <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-neutral-400 uppercase">Spent</p>
                    <p className="text-xl font-bold text-green-400">${userStats.spent}</p>
                 </div>
              </div>

              {/* Video Library (Mini) */}
              <div>
                 <h3 className="font-bold mb-4 flex items-center gap-2"><Layout size={18}/> User Videos</h3>
                 {userVideos.filter(v => v.userId === viewingUser.id).length === 0 ? (
                    <p className="text-sm text-neutral-500 italic">No videos generated yet.</p>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {userVideos.filter(v => v.userId === viewingUser.id).map(video => (
                          <div key={video.id} className="aspect-video bg-black rounded border border-white/10 relative group overflow-hidden">
                             {video.url ? <video src={video.url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><Image size={20} className="text-neutral-600"/></div>}
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-1.5 bg-white text-black rounded-full"><ExternalLink size={12}/></button>
                                <button className="p-1.5 bg-red-500 text-white rounded-full"><Trash2 size={12}/></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* Activity Log */}
              <div>
                 <h3 className="font-bold mb-4 flex items-center gap-2"><HardDrive size={18}/> Recent Activity</h3>
                 <div className="space-y-2">
                    {userLogs.length === 0 && <p className="text-sm text-neutral-500">No activity recorded.</p>}
                    {userLogs.slice(0, 5).map(log => (
                       <div key={log.id} className="text-sm p-3 rounded bg-white/5 flex justify-between">
                          <span>{log.action} <span className="text-neutral-500">{log.target}</span></span>
                          <span className="text-neutral-500 text-xs">{log.timestamp.toLocaleDateString()}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                 <Button variant="danger" className="w-full" onClick={() => { if(confirm("Delete this user?")) { deleteUser(viewingUser.id); setViewingUser(null); }}}>
                    <Trash2 size={16} className="mr-2"/> Delete User Account
                 </Button>
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-neutral-400">Manage accounts, permissions, and subscriptions.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" onClick={() => handleBulkAction('export')}><Download size={16} className="mr-2"/> Export CSV</Button>
           <Button><UserCog size={16} className="mr-2"/> Add User</Button>
        </div>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 text-neutral-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-neutral-600"
            />
         </div>
         <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.USER}>User</option>
            </select>
            <select 
              className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
         </div>
      </GlassCard>

      {/* Bulk Actions Bar */}
      {selectedUserIds.length > 0 && (
         <div className="bg-blue-600 text-white p-3 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2 fade-in">
            <span className="font-medium text-sm ml-2">{selectedUserIds.length} users selected</span>
            <div className="flex gap-2">
               <button onClick={() => handleBulkAction('email')} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors">Send Email</button>
               <button onClick={() => handleBulkAction('credits')} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors">Add Credits</button>
               <button onClick={() => setSelectedUserIds([])} className="px-2 py-1.5 hover:bg-white/20 rounded"><X size={16}/></button>
            </div>
         </div>
      )}

      {/* Users Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-neutral-400 border-b border-white/10">
              <tr>
                <th className="p-4 w-10">
                   <input type="checkbox" onChange={toggleSelectAll} checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0} className="rounded border-neutral-700 bg-neutral-800"/>
                </th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Credits</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className={`hover:bg-white/5 transition-colors ${selectedUserIds.includes(u.id) ? 'bg-blue-500/5' : ''}`}>
                  <td className="p-4">
                     <input 
                       type="checkbox" 
                       checked={selectedUserIds.includes(u.id)} 
                       onChange={() => toggleSelectUser(u.id)}
                       className="rounded border-neutral-700 bg-neutral-800"
                     />
                  </td>
                  <td className="p-4 cursor-pointer" onClick={() => setViewingUser(u)}>
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10" />
                      <div>
                        <div className="font-medium text-white hover:text-blue-400 transition-colors">{u.name}</div>
                        <div className="text-neutral-500 text-xs">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge color={u.plan === PlanType.ENTERPRISE ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-800'}>
                      {u.plan}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border ${u.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                       {u.status === 'active' ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-neutral-300">{u.credits}</td>
                  <td className="p-4 text-neutral-500">{u.joinedAt?.toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                     <button className="text-neutral-400 hover:text-white p-2" onClick={() => setViewingUser(u)}>
                        <MoreVertical size={16} />
                     </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                 <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500">No users found matching filters.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Detail Drawer */}
      {renderUserDetail()}
    </div>
  );
}