import { useState, useRef, ChangeEvent } from 'react';
import SafeHTML from './SafeHTML';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Ensure API_BASE_URL has proper http:// prefix
const getFullApiUrl = (path: string) => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `http://${baseUrl}`;
  }
  return `${baseUrl}${path}`;
};

interface ApiAnalysisResult {
  meta?: {
    title: string;
    description: string;
  };
  colorPalette: string[];
  layoutInfo: {
    width: number;
    height: number;
    hasHeader: boolean;
    hasFooter: boolean;
    layoutType: string;
    backgroundColor: string;
    fontFamily: string;
  };
  navigationItems: {
    text: string;
    href: string;
  }[];
  fontInfo: {
    dominantFont: string;
    dominantSize: string;
    fontVariety: number;
  };
  stylePreference: string;
  recommendations: {
    colorAdjustments: string;
    layoutImprovements: string;
    typographyChanges: string;
  };
}

interface AnalysisResult {
  analysis: string;
  thinking?: string;
  recommendation?: string;
  apiResult?: ApiAnalysisResult;
}

const ImageAnalysisPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [error, setError] = useState('');
  const [showThinking, setShowThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'file' | 'url'>('file');

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
    setAnalysisMode('file');
  };

  const handleUrlInput = (e: ChangeEvent<HTMLInputElement>) => {
    setWebsiteUrl(e.target.value);
    setAnalysisMode('url');
    setResult(null);
  };

  const handleAnalyze = async () => {
    // Validate input based on mode
    if (analysisMode === 'file' && (!fileInputRef.current?.files?.length)) {
      setError('Please select an image to analyze');
      return;
    }

    if (analysisMode === 'url' && !websiteUrl) {
      setError('Please enter a website URL to analyze');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (analysisMode === 'file') {
        await analyzeWithFile();
      } else {
        await analyzeWithUrl();
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWithFile = async () => {
    if (!fileInputRef.current?.files?.length) return;
    
    const file = fileInputRef.current.files[0];
    
    // First upload the file
    const formData = new FormData();
    formData.append('image', file);
    
    const uploadResponse = await fetch(getFullApiUrl('/api/upload'), {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }
    
    const uploadData = await uploadResponse.json();
    const imageUrl = uploadData.imageUrl;
    
    // Then analyze the uploaded image
    const analyzeResponse = await fetch(getFullApiUrl('/api/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    
    if (!analyzeResponse.ok) {
      const errorData = await analyzeResponse.json();
      throw new Error(errorData.message || 'Failed to analyze image');
    }
    
    const analysisData = await analyzeResponse.json();
    
    // Format the API response into a readable analysis
    const formattedAnalysis = formatApiResultToText(analysisData.analysis);
    
    setResult({
      analysis: formattedAnalysis,
      apiResult: analysisData.analysis
    });
  };

  const analyzeWithUrl = async () => {
    const analyzeResponse = await fetch(getFullApiUrl('/api/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: websiteUrl }),
    });
    
    if (!analyzeResponse.ok) {
      const errorData = await analyzeResponse.json();
      throw new Error(errorData.message || 'Failed to analyze website');
    }
    
    const analysisData = await analyzeResponse.json();
    
    // Format the API response into a readable analysis
    const formattedAnalysis = formatApiResultToText(analysisData.analysis);
    
    setResult({
      analysis: formattedAnalysis,
      apiResult: analysisData.analysis
    });
  };

  const formatApiResultToText = (apiResult: ApiAnalysisResult): string => {
    return `
# Website Analysis

## Overview
${apiResult.meta?.title ? `Title: ${apiResult.meta.title}` : ''}
${apiResult.meta?.description ? `\nDescription: ${apiResult.meta.description}` : ''}

## Style Analysis
Detected Style: **${apiResult.stylePreference}**

### Color Palette
${apiResult.colorPalette.map(color => `- ${color}`).join('\n')}

### Layout Information
- Type: ${apiResult.layoutInfo.layoutType}
- Has Header: ${apiResult.layoutInfo.hasHeader ? 'Yes' : 'No'}
- Has Footer: ${apiResult.layoutInfo.hasFooter ? 'Yes' : 'No'}
- Background Color: ${apiResult.layoutInfo.backgroundColor}

### Typography
- Dominant Font: ${apiResult.fontInfo.dominantFont}
- Dominant Size: ${apiResult.fontInfo.dominantSize}
- Font Variety: ${apiResult.fontInfo.fontVariety} different fonts detected

## Navigation
${apiResult.navigationItems.length > 0 ? apiResult.navigationItems.map(item => `- ${item.text} (${item.href})`).join('\n') : '- No navigation items detected'}

## Recommendations
1. COLORS: ${apiResult.recommendations.colorAdjustments}
2. LAYOUT: ${apiResult.recommendations.layoutImprovements}
3. TYPOGRAPHY: ${apiResult.recommendations.typographyChanges}
`;
  };

  const formatAnalysis = (text: string) => {
    // First format the text with HTML
    return text
      .replace(/(^|\n)#\s+(.*?)(\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-purple-300">$2</h2>')
      .replace(/(^|\n)##\s+(.*?)(\n|$)/g, '<h3 class="text-lg font-bold mt-4 mb-2 text-purple-200">$2</h3>')
      .replace(/(^|\n)###\s+(.*?)(\n|$)/g, '<h4 class="text-md font-bold mt-3 mb-2 text-purple-100">$2</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>')
      .replace(/- (.*?)(?=\n|$)/g, '<li class="ml-4 mb-1">$1</li>')
      .split('\n\n')
      .map(paragraph => `<p class="mb-3">${paragraph}</p>`)
      .join('');
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold font-display mb-6">AI Website Analysis</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Website URL
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400"
          placeholder="https://example.com"
          value={websiteUrl}
          onChange={handleUrlInput}
          aria-label="Website URL"
        />
        <p className="mt-1 text-sm text-gray-400">Enter URL to analyze directly, or upload a screenshot below</p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Website Screenshot (Optional)
        </label>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600/30 file:text-purple-300 hover:file:bg-purple-600/40"
          onChange={handleFileChange}
          aria-label="Upload website screenshot"
        />
      </div>
      
      {imagePreview && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
          <div className="relative w-full h-64 bg-gray-800/50 rounded-xl overflow-hidden border border-white/5">
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
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2 justify-center disabled:opacity-50 disabled:hover:shadow-none"
          onClick={handleAnalyze}
          disabled={isLoading || (analysisMode === 'file' && !fileInputRef.current?.files?.length) || (analysisMode === 'url' && !websiteUrl)}
          aria-label="Analyze website"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : analysisMode === 'url' ? 'Analyze Website' : 'Analyze Screenshot'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 text-red-300 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-8">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold font-display">Analysis Results</h3>
            {result.thinking && (
              <button
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => setShowThinking(!showThinking)}
                aria-label={showThinking ? "Hide AI thinking process" : "Show AI thinking process"}
              >
                {showThinking ? 'Hide AI Thinking Process' : 'Show AI Thinking Process'}
              </button>
            )}
          </div>
          
          {showThinking && result.thinking && (
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-white/5">
              <h4 className="text-md font-semibold mb-2 text-purple-300">AI Thinking Process:</h4>
              <div className="text-sm text-gray-300 whitespace-pre-line">
                {result.thinking}
              </div>
              
              {result.recommendation && (
                <>
                  <h4 className="text-md font-semibold mt-4 mb-2 text-purple-300">Initial Recommendations:</h4>
                  <div className="text-sm text-gray-300 whitespace-pre-line">
                    {result.recommendation}
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="p-5 bg-gray-800/30 border border-white/5 rounded-xl">
            <SafeHTML 
              html={formatAnalysis(result.analysis)}
              className="prose prose-invert max-w-none text-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysisPanel; 