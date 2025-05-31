import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AIAnalysisDashboard from '../AIAnalysisDashboard';

const AIAnalysisPanel = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold">AI Website Analysis Tools</h2>
        <Link 
          to="/dashboard/tools" 
          className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View all tools
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <AIAnalysisDashboard />
    </div>
  );
};

export default AIAnalysisPanel; 