import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard, Badge, Button } from '../../components/UI';
import { 
  Users, Zap, Coins, DollarSign, Video, 
  Activity, Clock, AlertTriangle, CheckCircle2, Info, Server
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const { stats, allUsers, userVideos, activityLogs } = useApp();

  // Metrics Calculations
  const metrics = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeToday = allUsers.filter(u => 
      u.lastActive && new Date(u.lastActive) >= startOfDay
    ).length;

    const creditsDistributed = allUsers.reduce((sum, u) => sum + (typeof u.credits === 'number' ? u.credits : 0), 0);

    const videosToday = userVideos.filter(v => 
      new Date(v.createdAt) >= startOfDay
    ).length;

    return {
      totalUsers: stats.totalUsers,
      activeToday,
      creditsDistributed,
      revenueMTD: stats.revenue,
      videosToday
    };
  }, [allUsers, stats.revenue, stats.totalUsers, userVideos]);

  // Mock Usage Data for Charts
  const usageData = [
    { name: 'Mon', videos: 45, errors: 2 },
    { name: 'Tue', videos: 52, errors: 1 },
    { name: 'Wed', videos: 38, errors: 0 },
    { name: 'Thu', videos: 65, errors: 4 },
    { name: 'Fri', videos: 48, errors: 2 },
    { name: 'Sat', videos: 25, errors: 1 },
    { name: 'Sun', videos: 30, errors: 0 },
  ];

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'error': return <AlertTriangle size={16} className="text-red-500" />;
      case 'warning': return <Activity size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-neutral-400">System health, analytics, and activity monitoring.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-500"><Users size={20} /></div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Total Users</p>
              <h3 className="text-2xl font-bold">{metrics.totalUsers}</h3>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 rounded-lg text-green-500"><Zap size={20} /></div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Active Today</p>
              <h3 className="text-2xl font-bold">{metrics.activeToday}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-500"><Coins size={20} /></div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Credits Dist.</p>
              <h3 className="text-2xl font-bold">{metrics.creditsDistributed.toLocaleString()}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-500"><DollarSign size={20} /></div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Revenue MTD</p>
              <h3 className="text-2xl font-bold">${metrics.revenueMTD.toFixed(2)}</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 rounded-lg text-red-500"><Video size={20} /></div>
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-semibold">Videos Today</p>
              <h3 className="text-2xl font-bold">{metrics.videosToday}</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage Analytics */}
        <div className="lg:col-span-2 space-y-8">
           <GlassCard className="p-6 h-[350px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold flex items-center gap-2"><Activity size={18} /> API Usage & Generations</h3>
                <Badge>Last 7 Days</Badge>
              </div>
              <ResponsiveContainer width="100%" height="100%" maxHeight={250}>
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="videos" stroke="#8884d8" fillOpacity={1} fill="url(#colorVideos)" />
                </AreaChart>
              </ResponsiveContainer>
           </GlassCard>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <GlassCard className="p-6 h-[250px]">
               <h3 className="font-semibold mb-4 text-sm uppercase text-neutral-400">Error Rates</h3>
               <ResponsiveContainer width="100%" height="100%" maxHeight={160}>
                 <BarChart data={usageData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                   <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                   <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   />
                   <Bar dataKey="errors" fill="#ef4444" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </GlassCard>

             <GlassCard className="p-6">
               <h3 className="font-semibold mb-4 text-sm uppercase text-neutral-400">System Health</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                   <div className="flex items-center gap-3">
                     <Server size={18} className="text-green-500" />
                     <span className="text-sm font-medium text-green-400">API Gateway</span>
                   </div>
                   <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Operational</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                   <div className="flex items-center gap-3">
                     <Zap size={18} className="text-green-500" />
                     <span className="text-sm font-medium text-green-400">Gemini Models</span>
                   </div>
                   <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Operational</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                   <div className="flex items-center gap-3">
                     <Clock size={18} className="text-green-500" />
                     <span className="text-sm font-medium text-green-400">Job Queue</span>
                   </div>
                   <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">Idle</span>
                 </div>
               </div>
             </GlassCard>
           </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-1">
          <GlassCard className="h-full max-h-[625px] flex flex-col">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock size={18} /> Activity Log</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {activityLogs.length === 0 && <p className="text-neutral-500 text-sm">No activity yet.</p>}
              {activityLogs.map((log) => (
                <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                  <div className="mt-0.5">{getLogIcon(log.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{log.action}</p>
                    <p className="text-neutral-400 text-xs truncate">
                      by <span className="text-white">{log.userName}</span>
                      {log.target && <span className="text-neutral-500"> on {log.target}</span>}
                    </p>
                  </div>
                  <div className="text-xs text-neutral-500 whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs border border-white/10">View Full Logs</Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}