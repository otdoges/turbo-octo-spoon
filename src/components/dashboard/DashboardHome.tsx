import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowRight, Sparkles, ExternalLink, Clock, BarChart2, Eye, Edit, Trash2, Plus } from 'lucide-react';

const data = [
  { name: 'Mon', value: 4 },
  { name: 'Tue', value: 3 },
  { name: 'Wed', value: 2 },
  { name: 'Thu', value: 6 },
  { name: 'Fri', value: 8 },
  { name: 'Sat', value: 9 },
  { name: 'Sun', value: 7 },
];

const DashboardHome = () => {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-900/10 to-indigo-900/10 p-6 rounded-xl border border-white/5">
        <h1 className="text-3xl font-display font-bold mb-2">Welcome back, Alex!</h1>
        <p className="text-gray-400 font-body">Here's what's happening with your websites today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { 
            label: 'Sites Transformed', 
            value: '12', 
            trend: '+3 this week',
            icon: <BarChart2 className="h-10 w-10 text-purple-400 opacity-50" />,
            color: 'from-purple-500/20 to-purple-400/5'
          },
          { 
            label: 'Active Projects', 
            value: '4', 
            trend: '2 pending review',
            icon: <Clock className="h-10 w-10 text-indigo-400 opacity-50" />,
            color: 'from-indigo-500/20 to-indigo-400/5'
          },
          { 
            label: 'Avg. Improvement', 
            value: '67%', 
            trend: '+12% from last month',
            icon: <ExternalLink className="h-10 w-10 text-pink-400 opacity-50" />,
            color: 'from-pink-500/20 to-pink-400/5'
          },
        ].map((stat, index) => (
          <div 
            key={index} 
            className={`relative overflow-hidden bg-gradient-to-br ${stat.color} backdrop-blur-sm p-6 rounded-xl border border-white/5 shadow-lg`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-300 text-sm font-medium mb-2 font-body">{stat.label}</h3>
                <div className="text-3xl font-display font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-green-400 font-body">{stat.trend}</div>
              </div>
              <div className="opacity-70">
                {stat.icon}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-white/5 to-white/0 blur-xl"></div>
          </div>
        ))}
      </div>

      {/* New Transformation CTA */}
      <div className="p-8 mb-8 bg-gradient-to-r from-purple-800/30 to-indigo-800/30 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="flex items-start justify-between relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-display font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">Start a New Transformation</h2>
            <p className="text-gray-300 mb-6 font-body">Enter your website URL to begin the AI-powered redesign process</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="https://your-website.com"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors shadow-inner"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-medium shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2 justify-center">
                Analyze & Transform
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center h-32 w-32 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-white/10">
            <Sparkles className="h-16 w-16 text-white" />
          </div>
        </div>
      </div>

      {/* Recent Activity and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-bold">Transformation Activity</h3>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors">Weekly</button>
              <button className="text-xs px-3 py-1 rounded-md bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">Monthly</button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff40" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1d',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  }}
                />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 shadow-lg">
          <h3 className="text-xl font-display font-bold mb-6">Performance Metrics</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Speed', value: 70 },
                    { name: 'Design', value: 85 },
                    { name: 'SEO', value: 60 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#a855f7" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#ec4899" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1d',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-300">Speed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
              <span className="text-sm text-gray-300">Design</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-pink-500"></div>
              <span className="text-sm text-gray-300">SEO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transformations */}
      <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold">Recent Transformations</h3>
          <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300 border border-white/5">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-white/5">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Update</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'E-commerce Store', url: 'store.example.com', status: 'Live', date: '2h ago' },
                { name: 'Portfolio Site', url: 'portfolio.example.com', status: 'In Progress', date: '5h ago' },
                { name: 'Blog Platform', url: 'blog.example.com', status: 'Review', date: '1d ago' },
                { name: 'Agency Website', url: 'agency.example.com', status: 'Live', date: '3d ago' },
              ].map((item, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mr-3 border border-white/10">
                        <span className="text-lg font-display">{item.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-400">{item.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Live' ? 'bg-green-500/20 text-green-300' :
                      item.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400">
                    {item.date}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Edit className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;