import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Wand2, ArrowRight, Check, Sparkles, PaintBucket, Palette, Layout, ArrowLeft, ExternalLink, Type, Monitor, Sliders, Eye, Shuffle, Upload, Globe } from 'lucide-react';
import AccessibleInput from '../ui/AccessibleInput';
import AccessibleButton from '../ui/AccessibleButton';
import logger from '../../utils/logger';

// Update API URLs to use environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Types
type UploadMode = 'url' | 'file';
type StylePreference = string | null;

interface ApiResponse {
  message?: string;
  screenshotUrl?: string;
  imageUrl?: string;
  analysis?: Record<string, unknown>;
}


const NewTransformation = () => {
  // State
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stylePreference, setStylePreference] = useState<StylePreference>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>('url');
  const [isDragging, setIsDragging] = useState(false);
  const [styles, setStyles] = useState<{id: string, name: string, icon: JSX.Element, description: string}[]>([]);
  const [colorPalettes, setColorPalettes] = useState<string[]>([]);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch styles from database on mount
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/styles`);
        if (!response.ok) {
          throw new Error('Failed to fetch styles');
        }
        
        const data = await response.json();
        
        // Map the styles data to include icons
        const stylesWithIcons = data.map((style: { iconType: string }) => {
          let icon;
          switch(style.iconType) {
            case 'layout':
              icon = <Layout />;
              break;
            case 'paintBucket':
              icon = <PaintBucket />;
              break;
            case 'type':
              icon = <Type />;
              break;
            default:
              icon = <Layout />;
          }
          
          return {
            ...style,
            icon
          };
        });
        
        setStyles(stylesWithIcons);
      } catch (error) {
        logger.error('Failed to fetch styles:', error instanceof Error ? error : new Error(String(error)));
        // Fallback to default styles if fetch fails
        setStyles([
          { id: 'minimalist', name: 'Minimalist', icon: <Layout />, description: 'Clean, simple and focused on content' },
          { id: 'modern', name: 'Bold & Modern', icon: <PaintBucket />, description: 'Vibrant colors and contemporary design elements' },
          { id: 'corporate', name: 'Professional', icon: <Type />, description: 'Refined, corporate-ready aesthetic' },
        ]);
      }
    };
    
    const fetchColorPalettes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/color-palettes`);
        if (!response.ok) {
          throw new Error('Failed to fetch color palettes');
        }
        
        const data = await response.json();
        setColorPalettes(data);
      } catch (error) {
        logger.error('Failed to fetch color palettes:', error instanceof Error ? error : new Error(String(error)));
        // Fallback to default colors if fetch fails
        setColorPalettes(['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B']);
      }
    };
    
    fetchStyles();
    fetchColorPalettes();
  }, []);

  // Handlers for URL submission
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setScreenshotError(null);

    try {
      const screenshotData = await captureScreenshot(url);
      await analyzeImage(screenshotData.screenshotUrl);
      
      // Skip to transformation step (Step 3)
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStep(3);
      }, 1000);
    } catch (error) {
      handleApiError(error, 'Failed to capture screenshot');
    }
  };

  // API call to capture screenshot
  const captureScreenshot = async (siteUrl: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: siteUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to capture screenshot');
    }

    // Save screenshot URL (directly from the service)
    setScreenshotUrl(data.screenshotUrl);
    return data;
  };

  // File upload handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsAnalyzing(true);
    setScreenshotError(null);
    
    const file = e.target.files[0];
    
    if (!validateFile(file)) {
      return;
    }
    
    try {
      const uploadData = await uploadImage(file);
      await analyzeImage(uploadData.imageUrl);
      
      // Skip to transformation step (Step 3)
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStep(3);
      }, 1000);
    } catch (error) {
      handleApiError(error, 'Failed to process image');
    }
  };

  // File validation
  const validateFile = (file: File): boolean => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setScreenshotError('Only image files are allowed');
      setIsAnalyzing(false);
      return false;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setScreenshotError('File size exceeds 10MB limit');
      setIsAnalyzing(false);
      return false;
    }
    
    return true;
  };

  // API call to upload image
  const uploadImage = async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }
    
    // Save the image URL
    setScreenshotUrl(data.imageUrl);
    return data;
  };

  // API call to analyze image
  const analyzeImage = async (imageUrl: string | undefined): Promise<ApiResponse> => {
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to analyze image');
    }
    
    // Process analysis data 
    logger.info('Analysis results:', data.analysis);
    
    return data;
  };

  // Error handling function
  const handleApiError = (error: unknown, fallbackMessage: string) => {
    logger.error('API Error:', error instanceof Error ? error : { message: String(error) });
    setScreenshotError(
      typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : fallbackMessage
    );
    setIsAnalyzing(false);
  };

  // Navigation functions
  const proceedToNextStep = () => {
    setTimeout(() => {
      setIsAnalyzing(false);
      // Skip to transformation step (Step 3)
      setCurrentStep(3);
    }, 1000);
  };

  const handleStyleSelection = (style: string) => {
    setStylePreference(style);
    setCurrentStep(3);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (!validateFile(file)) {
        return;
      }
      
      // Create a synthetic event to use with handleFileUpload
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileUpload(syntheticEvent);
    }
  }, []);

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div 
            className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep === step 
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
              : currentStep > step 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-white/10 text-gray-400'}`}
          >
            {currentStep > step ? (
              <Check className="h-5 w-5" />
            ) : (
              <span>{step}</span>
            )}
          </div>
          {step < 4 && (
            <div 
              className={`h-0.5 w-12 ${currentStep > step 
                ? 'bg-green-500/20' 
                : 'bg-white/10'}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Render URL input form
  const renderUrlForm = () => (
    <form onSubmit={handleUrlSubmit} className="relative z-10 space-y-6 max-w-2xl">
      <div className="flex">
        <div className="flex-1">
          <AccessibleInput
            label="Website URL"
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-website.com"
            className="rounded-r-none"
            fullWidth
            required
          />
        </div>
        <AccessibleButton
          type="submit"
          disabled={isAnalyzing}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-r-xl text-white font-medium shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2 h-[42px] mt-6"
          aria-label={isAnalyzing ? "Analyzing website" : "Analyze website"}
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-5 h-5 animate-pulse" />
              Analyzing...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Analyze Site
            </>
          )}
        </AccessibleButton>
      </div>
      
      {renderAnalysisProgress()}
      {renderErrorMessage()}
    </form>
  );

  // Render file upload UI
  const renderFileUpload = () => (
    <div className="relative z-10 space-y-6 max-w-2xl">
      <div>
        <label htmlFor="image-upload" className="block text-sm font-medium mb-2 text-gray-300">
          Upload Website Image
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()} 
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-purple-500 bg-purple-500/10' 
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
          role="button"
          aria-label="Upload image"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
        >
          <input 
            ref={fileInputRef}
            id="image-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={isAnalyzing}
            aria-label="Upload image file"
          />
          <Upload className={`h-12 w-12 mx-auto mb-3 ${isDragging ? 'text-purple-400' : 'text-gray-400'}`} />
          <p className="text-gray-300 font-medium mb-1">
            {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-gray-400 text-sm">PNG, JPG or WEBP (max. 10MB)</p>
        </div>
      </div>

      {renderAnalysisProgress()}
      {renderErrorMessage()}
    </div>
  );

  // Render analysis progress
  const renderAnalysisProgress = () => (
    isAnalyzing && (
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-4 mb-2">
          <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-300">
            {uploadMode === 'url' 
              ? 'Taking screenshot and analyzing website structure...' 
              : 'Analyzing website image...'}
          </p>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-progress-indeterminate"></div>
        </div>
      </div>
    )
  );

  // Render error message
  const renderErrorMessage = () => (
    screenshotError && !isAnalyzing && (
      <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 mt-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-red-300 font-medium">Screenshot Error</p>
            <p className="text-gray-300 text-sm">{screenshotError}</p>
          </div>
        </div>
        <AccessibleButton
          onClick={() => setScreenshotError(null)}
          className="mt-2 text-sm text-red-300 hover:text-red-200 transition-colors"
          variant="ghost"
          size="sm"
          aria-label="Dismiss error"
        >
          Dismiss
        </AccessibleButton>
      </div>
    )
  );

  // Render upload mode toggle
  const renderUploadModeToggle = () => (
    <div className="flex mb-6 bg-gray-800/50 rounded-lg p-1 max-w-xs">
      <AccessibleButton 
        onClick={() => setUploadMode('url')}
        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all flex-1 ${
          uploadMode === 'url' 
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
            : 'text-gray-400 hover:text-white'
        }`}
        variant={uploadMode === 'url' ? 'primary' : 'ghost'}
        aria-label="Switch to URL mode"
        aria-pressed={uploadMode === 'url'}
      >
        <Globe className="h-4 w-4" />
        <span>URL</span>
      </AccessibleButton>
      <AccessibleButton 
        onClick={() => setUploadMode('file')}
        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all flex-1 ${
          uploadMode === 'file' 
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
            : 'text-gray-400 hover:text-white'
        }`}
        variant={uploadMode === 'file' ? 'primary' : 'ghost'}
        aria-label="Switch to image upload mode"
        aria-pressed={uploadMode === 'file'}
      >
        <Upload className="h-4 w-4" />
        <span>Image</span>
      </AccessibleButton>
    </div>
  );

  // Main render function
  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-display font-bold mb-2">New Transformation</h2>
        <p className="text-gray-400 mb-6">Transform your website with AI-powered design</p>
        
        <StepIndicator />

        {/* Step 1: URL Input & Analysis */}
        {currentStep === 1 && (
          <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-white/5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <h3 className="text-xl font-display font-medium mb-4">Step 1: Enter Your Website URL</h3>
            <p className="text-gray-300 mb-6">We'll analyze your current website to provide the best transformation</p>
            
            {renderUploadModeToggle()}
            {uploadMode === 'url' ? renderUrlForm() : renderFileUpload()}
          </div>
        )}

        {/* Step 2: Style Selection */}
        {currentStep === 2 && (
          <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-white/5 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-display font-medium mb-1">Step 2: Choose Your Design Style</h3>
                <p className="text-gray-400">Select a design direction for your website transformation</p>
              </div>
              <button 
                onClick={goToPreviousStep}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {styles.map((style) => (
                <div 
                  key={style.id}
                  onClick={() => handleStyleSelection(style.id)}
                  className={`p-6 rounded-xl border cursor-pointer transition-all ${stylePreference === style.id
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-4 border border-white/10">
                    {style.icon}
                  </div>
                  <h4 className="text-lg font-display font-medium mb-2">{style.name}</h4>
                  <p className="text-gray-400 text-sm">{style.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleStyleSelection(styles.length > 0 ? styles[0].id : 'minimalist')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-medium shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Live Preview & Customization */}
        {currentStep === 3 && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg">
            <div className="p-6 border-b border-white/5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-display font-medium mb-1">Step 3: Preview & Customize</h3>
                  <p className="text-gray-400">Fine-tune your website's appearance</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={goToPreviousStep}
                    className="p-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNextStep}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-white font-medium shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row h-[600px]">
              {/* Preview Panel */}
              <div className="flex-1 p-6 border-r border-white/5 overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      Desktop View
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded border border-white/10 text-gray-400 hover:bg-white/5 transition-colors">
                      <Shuffle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-white h-[500px] rounded-lg overflow-hidden">
                  <img 
                    src={screenshotUrl || "https://placehold.co/800x600/e2e8f0/1e293b?text=Website+Preview"} 
                    alt="Website Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Customization Panel */}
              <div className="w-full lg:w-80 p-6 overflow-y-auto">
                <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-4">Customization</h4>
                
                <div className="space-y-6">
                  {/* Color Palette */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Color Palette</label>
                      <Palette className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {colorPalettes.map((color) => (
                        <div 
                          key={color} 
                          className="h-10 rounded-md cursor-pointer p-0.5"
                          style={{ background: `${color}20` }}
                        >
                          <div 
                            className="h-full w-full rounded-sm border border-white/10" 
                            style={{ background: color }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Typography</label>
                      <Type className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <button className="w-full p-2 flex items-center justify-between rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <span>Satoshi</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="w-full p-2 flex items-center justify-between rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <span>Inter</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Component Styles */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Component Style</label>
                      <Sliders className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-sm">Border Radius</span>
                        <div className="flex items-center gap-2">
                          <button className="h-6 w-6 rounded-md bg-white/10 text-sm flex items-center justify-center hover:bg-white/20 transition-colors">S</button>
                          <button className="h-6 w-6 rounded-md bg-purple-500/30 text-sm flex items-center justify-center text-purple-300 font-medium">M</button>
                          <button className="h-6 w-6 rounded-md bg-white/10 text-sm flex items-center justify-center hover:bg-white/20 transition-colors">L</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-sm">Button Style</span>
                        <div className="flex items-center gap-2">
                          <button className="h-6 w-6 rounded-md bg-white/10 text-sm flex items-center justify-center hover:bg-white/20 transition-colors">1</button>
                          <button className="h-6 w-6 rounded-md bg-purple-500/30 text-sm flex items-center justify-center text-purple-300 font-medium">2</button>
                          <button className="h-6 w-6 rounded-md bg-white/10 text-sm flex items-center justify-center hover:bg-white/20 transition-colors">3</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {currentStep === 4 && (
          <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-white/5 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-display font-medium mb-1">Step 4: Review & Launch</h3>
                <p className="text-gray-400">Your transformation is ready to go live</p>
              </div>
              <button 
                onClick={goToPreviousStep}
                className="p-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-medium mb-4">Original Website</h4>
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <img 
                    src={screenshotUrl || "https://placehold.co/800x600/1e293b/475569?text=Original+Website"} 
                    alt="Original Website" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-4">Transformed Website</h4>
                <div className="aspect-video bg-white rounded-lg overflow-hidden">
                  <img 
                    src="/images/transformed-preview.jpg" 
                    alt="Transformed Website" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg border border-white/10 mb-8">
              <h4 className="text-lg font-medium mb-2">Transformation Summary</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Applied {stylePreference || 'selected'} design style with clean typography</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Optimized color scheme for better visual hierarchy</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Improved navigation structure and user flow</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Enhanced mobile responsiveness and performance</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium border border-white/10 transition-all flex items-center gap-2">
                Download Assets
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-medium shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2">
                Launch New Website
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewTransformation;