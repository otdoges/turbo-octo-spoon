import ImageAnalysisPanel from './ImageAnalysisPanel';

const AIAnalysisDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold font-display text-center mb-2">
          AI Website Optimization Suite
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Powered by Gemini and DeepSeek
        </p>

        <div>
          <ImageAnalysisPanel />
        </div>

        <div className="mt-12 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg p-6 text-center">
          <h3 className="text-xl font-bold font-display mb-2">How Our AI Team Works</h3>
          <p className="text-gray-300 mb-6">
            Our AI system combines multiple powerful models working as a team:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 p-6 rounded-xl border border-white/5 shadow-md">
              <h4 className="font-semibold text-purple-300 mb-2">DeepSeek R1</h4>
              <p className="text-sm text-gray-300">
                Acts as the strategic "thinking brain" of our system for website optimization.
                It deeply analyzes your inputs and provides strategic recommendations.
              </p>
            </div>
            <div className="bg-gray-800/30 p-6 rounded-xl border border-white/5 shadow-md">
              <h4 className="font-semibold text-purple-300 mb-2">Gemini 2.5 Flash</h4>
              <p className="text-sm text-gray-300">
                Functions as the "implementation brain" for visual and content analysis. 
                Transforms DeepSeek's strategic thinking into specific, actionable improvements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisDashboard; 