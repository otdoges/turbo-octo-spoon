import React, { useState, useRef } from 'react';
import { UploadCloud, Image, FileText, Search, BarChart2, BrainCog, Code, LightbulbIcon, ArrowDown } from 'lucide-react';
import geminiService from '../../services/geminiService';

// Tabs for different AI analyses
type AnalysisTab = 'image' | 'content' | 'seo' | 'conversion';

interface AnalysisResult {
  analysis?: string;
  enhancement?: string;
  optimization?: string;
  thinking: string;
  recommendation: string;
}

const AIAnalysisPanel = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [content, setContent] = useState('');
  const [userFlow, setUserFlow] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload for image analysis
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Run the selected AI analysis
  const runAnalysis = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      let analysisResult: AnalysisResult;
      
      // Define metadata outside switch statement to avoid lexical declaration error
      const metadata = {
        title: websiteUrl ? `Website: ${websiteUrl}` : 'Sample Website',
        description: 'Sample metadata for SEO analysis',
        url: websiteUrl || 'https://example.com',
      };
      
      switch (activeTab) {
        case 'image':
          if (!imageFile) {
            throw new Error('Please upload an image first');
          }
          analysisResult = await geminiService.analyzeWebsiteImage(imageFile, websiteUrl);
          break;
          
        case 'content':
          if (!content.trim()) {
            throw new Error('Please enter some content to analyze');
          }
          analysisResult = await geminiService.enhanceContent(content);
          break;
          
        case 'seo':
          // Use the metadata object defined above
          analysisResult = await geminiService.analyzeSEO(metadata, content);
          break;
          
        case 'conversion':
          if (!userFlow.trim()) {
            throw new Error('Please describe the user flow to analyze');
          }
          analysisResult = await geminiService.optimizeConversion(userFlow);
          break;
          
        default:
          throw new Error('Invalid analysis type');
      }
      
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({
        thinking: 'Error in analysis process',
        recommendation: 'Could not complete analysis',
        analysis: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get the main result text based on active tab
  const getMainResult = () => {
    if (!result) return '';
    
    switch (activeTab) {
      case 'image': return result.analysis || '';
      case 'content': return result.enhancement || '';
      case 'seo': return result.analysis || '';
      case 'conversion': return result.optimization || '';
      default: return '';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 shadow-lg">
      <h2 className="text-2xl font-display font-bold mb-2">AI Analysis</h2>
      <p className="text-gray-400 text-sm mb-6">Powered by a collaborative team of AI engineers</p>
      
      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTab === 'image' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('image')}
        >
          <Image className="h-4 w-4" />
          Image Analysis
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTab === 'content' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('content')}
        >
          <FileText className="h-4 w-4" />
          Content Enhancement
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTab === 'seo' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('seo')}
        >
          <Search className="h-4 w-4" />
          SEO Analysis
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTab === 'conversion' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('conversion')}
        >
          <BarChart2 className="h-4 w-4" />
          Conversion Optimization
        </button>
      </div>
      
      {/* Input section */}
      <div className="mb-6">
        {activeTab === 'image' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Website URL (optional)</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            
            <div 
              onClick={handleImageUploadClick}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                imagePreview ? 'border-purple-500/30 bg-purple-500/5' : 'border-white/10 hover:border-white/20 bg-gray-800/30'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              {imagePreview ? (
                <div>
                  <img 
                    src={imagePreview} 
                    alt="Website preview" 
                    className="max-h-64 mx-auto rounded-lg mb-4 shadow-lg" 
                  />
                  <p className="text-sm text-gray-400">Click to upload a different image</p>
                </div>
              ) : (
                <div className="py-6">
                  <UploadCloud className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 font-medium mb-1">Upload a website screenshot</p>
                  <p className="text-sm text-gray-400">Drag and drop or click to browse</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'content' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Website Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your website content here for analysis and enhancement suggestions..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 min-h-[200px]"
            />
          </div>
        )}
        
        {activeTab === 'seo' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content (optional)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste page content for more detailed SEO analysis..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 min-h-[150px]"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'conversion' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User Flow Description</label>
            <textarea
              value={userFlow}
              onChange={(e) => setUserFlow(e.target.value)}
              placeholder="Describe your conversion flow (e.g., signup process, checkout flow, etc.)..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 min-h-[200px]"
            />
          </div>
        )}
      </div>
      
      {/* Analysis button */}
      <button
        onClick={runAnalysis}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
          loading
            ? 'bg-purple-700/50 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg hover:shadow-purple-500/20'
        } transition-all`}
      >
        {loading ? (
          <>
            <div className="h-5 w-5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
            Analyzing...
          </>
        ) : (
          <>
            Run {activeTab === 'image' ? 'Image Analysis' : 
               activeTab === 'content' ? 'Content Enhancement' :
               activeTab === 'seo' ? 'SEO Analysis' : 'Conversion Optimization'}
          </>
        )}
      </button>
      
      {/* Results */}
      {result && (
        <div className="mt-8">
          {/* Team approach explanation */}
          <div className="mb-6 bg-gray-800/30 border border-purple-500/20 rounded-xl p-4 flex items-start gap-4">
            <div className="bg-purple-500/20 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0">
              <BrainCog className="h-5 w-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-md font-semibold text-purple-300 mb-1">AI Engineering Team Approach</h3>
              <p className="text-sm text-gray-300 mb-2">
                Our AI team worked collaboratively on this analysis:
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <LightbulbIcon className="h-4 w-4 text-yellow-300" />
                  <span className="text-gray-300">Strategy by DeepSeek R1</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-300" />
                  <span className="text-gray-300">Implementation by Gemini 2.5</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Thinking process toggle */}
          <button 
            onClick={() => setShowThinking(!showThinking)}
            className="w-full flex items-center justify-between bg-gray-800/50 border border-white/10 rounded-xl p-4 mb-4 hover:bg-gray-800/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BrainCog className="h-5 w-5 text-purple-400" />
              <span className="font-medium">View AI Thinking Process</span>
            </div>
            <ArrowDown className={`h-5 w-5 text-gray-400 transition-transform ${showThinking ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Thinking process */}
          {showThinking && (
            <div className="mb-4 bg-gray-900/80 border border-white/5 rounded-xl p-5">
              <div className="mb-4">
                <h3 className="text-md font-bold mb-2 text-purple-300">Strategy Team Thinking</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm text-gray-300 overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-700">
                  {result.thinking}
                </div>
              </div>
              <div>
                <h3 className="text-md font-bold mb-2 text-indigo-300">Strategy Recommendations</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm text-gray-300 overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-700">
                  {result.recommendation}
                </div>
              </div>
            </div>
          )}
          
          {/* Final result */}
          <div className="bg-gray-800/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-display font-bold mb-4">
              {activeTab === 'image' ? 'Image Analysis Results' : 
               activeTab === 'content' ? 'Enhanced Content' :
               activeTab === 'seo' ? 'SEO Improvements' : 'Conversion Optimization'}
            </h3>
            <div className="prose prose-invert max-w-none">
              {getMainResult().split('\n').map((line, i) => (
                <p key={i} className={line.trim().startsWith('#') ? 'text-xl font-bold mt-4' : 'mb-3'}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel; 