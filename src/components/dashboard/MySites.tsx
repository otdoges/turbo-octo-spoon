import React from 'react';
import { Globe, Edit3, Trash2 } from 'lucide-react';

const sites = [
  {
    id: 1,
    name: 'Example Site 1',
    url: 'https://example1.com',
    status: 'Live',
    lastModified: '2024-03-15'
  },
  {
    id: 2,
    name: 'Example Site 2',
    url: 'https://example2.com',
    status: 'In Progress',
    lastModified: '2024-03-14'
  }
];

const MySites = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold mb-6">My Sites</h2>
      
      <div className="grid gap-6">
        {sites.map((site) => (
          <div key={site.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="font-display font-bold">{site.name}</h3>
                <p className="text-sm text-gray-400">{site.url}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                site.status === 'Live' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {site.status}
              </span>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Edit3 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MySites;