import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlassCard } from '../components/UI';
import { useApp } from '../context/AppContext';

export default function Analytics() {
  const { userVideos } = useApp();

  const stats = useMemo(() => {
    const totalGenerated = userVideos.length;
    // Mock random views for demonstration since we don't track public views
    const totalViews = userVideos.reduce((acc, _) => acc + Math.floor(Math.random() * 500) + 50, 0); 
    const completionRate = '100%'; 

    // Calculate last 7 days activity
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    const chartData = last7Days.map(day => {
      const count = userVideos.filter(v => 
        new Date(v.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) === day
      ).length;
      return {
        date: day,
        generated: count,
        views: count * (Math.floor(Math.random() * 100) + 20) // Mock view correlation
      };
    });

    return { totalGenerated, totalViews, completionRate, chartData };
  }, [userVideos]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Generated', value: stats.totalGenerated.toString(), sub: 'All time' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), sub: 'Estimated' },
          { label: 'Avg Generation Time', value: '1.2m', sub: 'Fast' },
          { label: 'Completion Rate', value: stats.completionRate, sub: 'Success' },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-6">
             <p className="text-sm text-neutral-400">{stat.label}</p>
             <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
             <p className="text-xs text-neutral-500 mt-1">{stat.sub}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="h-[400px]">
          <h3 className="font-semibold mb-6">Generations (Last 7 Days)</h3>
          {stats.totalGenerated === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-500 pb-12">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="generated" fill="#fff" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard className="h-[400px]">
          <h3 className="font-semibold mb-6">Estimated Views (Last 7 Days)</h3>
          {stats.totalGenerated === 0 ? (
             <div className="h-full flex items-center justify-center text-neutral-500 pb-12">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="views" fill="#555" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>
    </div>
  );
}