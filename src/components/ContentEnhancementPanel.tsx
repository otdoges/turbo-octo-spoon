import { useState } from 'react';
import geminiService from '../services/geminiService';
import SafeHTML from './SafeHTML';

interface EnhancementResult {
  enhancement: string;
  thinking: string;
  recommendation: string;
}

const ContentEnhancementPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EnhancementResult | null>(null);
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [error, setError] = useState('');
  const [showThinking, setShowThinking] = useState(false);

  const handleEnhance = async () => {
    if (!content.trim()) {
      setError('Please enter content to enhance');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const enhancementResult = await geminiService.enhanceContent(
        content, 
        targetAudience || undefined
      );
      setResult(enhancementResult);
    } catch (err) {
      console.error('Enhancement error:', err);
      setError('Failed to enhance content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatEnhancement = (text: string) => {
    return text
      .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-lg font-bold mt-4 mb-2 text-indigo-700">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4 mb-1">$1</li>')
      .split('\n\n')
      .map(paragraph => `<p class="mb-3">${paragraph}</p>`)
      .join('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Content Enhancement</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience (optional)
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Small business owners, Tech professionals, etc."
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content to Enhance
        </label>
        <textarea
          className="w-full h-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Paste your content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      
      <div className="mb-8">
        <button
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          onClick={handleEnhance}
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enhancing...
            </>
          ) : 'Enhance Content'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-8">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Enhanced Content</h3>
            <button
              className="text-sm text-indigo-600 hover:text-indigo-800"
              onClick={() => setShowThinking(!showThinking)}
            >
              {showThinking ? 'Hide AI Thinking Process' : 'Show AI Thinking Process'}
            </button>
          </div>
          
          {showThinking && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h4 className="text-md font-semibold mb-2 text-gray-700">DeepSeek R1 Thinking Process:</h4>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {result.thinking}
              </div>
              
              <h4 className="text-md font-semibold mt-4 mb-2 text-gray-700">Initial Recommendations:</h4>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {result.recommendation}
              </div>
            </div>
          )}
          
          <div className="p-5 bg-white border border-gray-200 rounded-md">
            <SafeHTML 
              html={formatEnhancement(result.enhancement)}
              className="prose max-w-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentEnhancementPanel; 