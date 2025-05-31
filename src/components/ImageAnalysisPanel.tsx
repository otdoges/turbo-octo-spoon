import { useState, useRef, ChangeEvent } from 'react';
import geminiService from '../services/geminiService';
import DOMPurify from 'dompurify';

interface AnalysisResult {
  analysis: string;
  thinking: string;
  recommendation: string;
}

const ImageAnalysisPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [error, setError] = useState('');
  const [showThinking, setShowThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Create image preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear previous results
    setError('');
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!fileInputRef.current?.files?.length) {
      setError('Please select an image to analyze');
      return;
    }

    const file = fileInputRef.current.files[0];
    setIsLoading(true);
    setError('');

    try {
      const analysisResult = await geminiService.analyzeWebsiteImage(
        file, 
        websiteUrl || undefined
      );
      setResult(analysisResult);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnalysis = (text: string) => {
    // First format the text with HTML
    const formatted = text
      .replace(/(\d+\.\s+[A-Z\s]+:)/g, '<h3 class="text-lg font-bold mt-4 mb-2 text-indigo-700">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4 mb-1">$1</li>')
      .split('\n\n')
      .map(paragraph => `<p class="mb-3">${paragraph}</p>`)
      .join('');
    
    // Sanitize the HTML to prevent XSS attacks
    return DOMPurify.sanitize(formatted, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [
        'h3', 'strong', 'li', 'p', 'ul', 'ol', 'em', 'b', 'i', 'span'
      ],
      ALLOWED_ATTR: ['class', 'style']
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">AI Website Image Analysis</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website URL (optional)
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="https://example.com"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Website Screenshot
        </label>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          onChange={handleFileChange}
        />
      </div>
      
      {imagePreview && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <button
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          onClick={handleAnalyze}
          disabled={isLoading || !fileInputRef.current?.files?.length}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : 'Analyze Image'}
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
            <h3 className="text-xl font-bold text-gray-800">Analysis Results</h3>
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
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatAnalysis(result.analysis)) }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysisPanel; 