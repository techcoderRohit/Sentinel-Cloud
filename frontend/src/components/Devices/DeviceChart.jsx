"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const DeviceChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-slate-500 italic text-sm">Waiting for live data...</div>;

    const chartData = data.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: item.payload?.temperature || 0,
        hum: item.payload?.humidity || 0
    }));

    return (
        <div className="h-56 w-full mt-4 bg-slate-900/30 rounded-xl p-2 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="temp" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                    <Area type="monotone" dataKey="hum" stroke="#818cf8" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DeviceChart;