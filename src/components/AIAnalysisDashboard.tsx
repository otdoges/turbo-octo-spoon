import { useState } from 'react';
import ImageAnalysisPanel from './ImageAnalysisPanel';
import ContentEnhancementPanel from './ContentEnhancementPanel';
import CodeAssistantPanel from './CodeAssistantPanel';

type AnalysisType = 'image' | 'content' | 'code';

const AIAnalysisDashboard = () => {
  const [activeTab, setActiveTab] = useState<AnalysisType>('image');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          AI Website & Code Optimization Suite
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Powered by Gemini, DeepSeek, and GitHub AI Models
        </p>

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'image'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('image')}
              >
                Image Analysis
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('content')}
              >
                Content Enhancement
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'code'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('code')}
              >
                Code Assistant
              </button>
            </nav>
          </div>
        </div>

        <div>
          {activeTab === 'image' && <ImageAnalysisPanel />}
          {activeTab === 'content' && <ContentEnhancementPanel />}
          {activeTab === 'code' && <CodeAssistantPanel />}
        </div>

        <div className="mt-12 bg-gray-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">How Our AI Team Works</h3>
          <p className="text-gray-600 mb-4">
            Our AI system combines multiple powerful models working as a team:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-indigo-700 mb-2">DeepSeek R1</h4>
              <p className="text-sm text-gray-700">
                Acts as the strategic "thinking brain" of our system for website optimization.
                It deeply analyzes your inputs and provides strategic recommendations.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-indigo-700 mb-2">Gemini 2.5 Flash</h4>
              <p className="text-sm text-gray-700">
                Functions as the "implementation brain" for visual and content analysis. 
                Transforms DeepSeek's strategic thinking into specific, actionable improvements.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-indigo-700 mb-2">GitHub AI Models</h4>
              <p className="text-sm text-gray-700">
                Provides specialized code intelligence using GPT-4.1 and O4 Mini models for debugging, refactoring,
                security analysis, and test generation. Requires a GitHub token.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisDashboard; 