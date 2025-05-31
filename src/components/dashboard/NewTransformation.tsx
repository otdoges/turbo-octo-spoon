import React, { useState, useRef, useCallback } from 'react';
import { Wand2, ArrowRight, Check, Sparkles, PaintBucket, Palette, Layout, ArrowLeft, ExternalLink, Type, Monitor, Sliders, Eye, Shuffle, Upload, Globe } from 'lucide-react';

const NewTransformation = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stylePreference, setStylePreference] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setScreenshotError(null);

    if (uploadMode === 'url') {
      try {
        // Call screenshot API
        const response = await fetch('http://localhost:3001/api/screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to capture screenshot');
        }

        // Save screenshot URL
        setScreenshotUrl(`http://localhost:3001${data.screenshotUrl}`);
        
        // Continue to next step
        setTimeout(() => {
          setIsAnalyzing(false);
          setCurrentStep(2);
        }, 1000);
      } catch (error) {
        console.error('Error taking screenshot:', error);
        setScreenshotError(typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message 
          : 'Failed to capture screenshot');
        setIsAnalyzing(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsAnalyzing(true);
    setScreenshotError(null);
    
    const file = e.target.files[0];
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setScreenshotError('Only image files are allowed');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setScreenshotError('File size exceeds 10MB limit');
      return;
    }
    
    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      // Upload the file to the server
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }
      
      // Save the image URL
      setScreenshotUrl(`http://localhost:3001${data.imageUrl}`);
      
      // Call the analyze endpoint
      const analysisResponse = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: data.imageUrl }),
      });
      
      const analysisData = await analysisResponse.json();
      
      if (!analysisResponse.ok) {
        throw new Error(analysisData.message || 'Failed to analyze image');
      }
      
      // Process analysis data here (to be implemented with AI integration)
      console.log('Analysis results:', analysisData.analysis);
      
      // Continue to next step
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStep(2);
      }, 1000);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setScreenshotError(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : 'Failed to process image');
      setIsAnalyzing(false);
    }
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

  // Handle drag events
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
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setScreenshotError('Only image files are allowed');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setScreenshotError('File size exceeds 10MB limit');
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
            
            {/* Upload mode toggle */}
            <div className="flex mb-6 bg-gray-800/50 rounded-lg p-1 max-w-xs">
              <button 
                onClick={() => setUploadMode('url')}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all flex-1 ${
                  uploadMode === 'url' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>URL</span>
              </button>
              <button 
                onClick={() => setUploadMode('file')}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all flex-1 ${
                  uploadMode === 'file' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>Image</span>
              </button>
            </div>
            
            {uploadMode === 'url' ? (
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6 max-w-2xl">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium mb-2 text-gray-300">
                    Website URL
                  </label>
                  <div className="flex">
                    <input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://your-website.com"
                      className="flex-1 px-4 py-3 rounded-l-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-r-xl text-white font-medium shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2"
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
                    </button>
                  </div>
                </div>
                
                {isAnalyzing && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                      <p className="text-gray-300">Taking screenshot and analyzing website structure...</p>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-progress-indeterminate"></div>
                    </div>
                  </div>
                )}

                {screenshotError && !isAnalyzing && (
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 mt-4">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-red-300 font-medium">Screenshot Error</p>
                        <p className="text-gray-300 text-sm">{screenshotError}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setScreenshotError(null)}
                      className="mt-2 text-sm text-red-300 hover:text-red-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </form>
            ) : (
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
                  >
                    <input 
                      ref={fileInputRef}
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={isAnalyzing}
                    />
                    <Upload className={`h-12 w-12 mx-auto mb-3 ${isDragging ? 'text-purple-400' : 'text-gray-400'}`} />
                    <p className="text-gray-300 font-medium mb-1">
                      {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-gray-400 text-sm">PNG, JPG or WEBP (max. 10MB)</p>
                  </div>
                </div>

                {isAnalyzing && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                      <p className="text-gray-300">Analyzing website image...</p>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-progress-indeterminate"></div>
                    </div>
                  </div>
                )}

                {screenshotError && !isAnalyzing && (
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 mt-4">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-red-300 font-medium">Upload Error</p>
                        <p className="text-gray-300 text-sm">{screenshotError}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setScreenshotError(null)}
                      className="mt-2 text-sm text-red-300 hover:text-red-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}
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
              {[
                { id: 'minimalist', name: 'Minimalist', icon: <Layout />, description: 'Clean, simple and focused on content' },
                { id: 'modern', name: 'Bold & Modern', icon: <PaintBucket />, description: 'Vibrant colors and contemporary design elements' },
                { id: 'corporate', name: 'Professional', icon: <Type />, description: 'Refined, corporate-ready aesthetic' },
              ].map((style) => (
                <div 
                  key={style.id}
                  onClick={() => handleStyleSelection(style.id)}
                  className={`p-6 rounded-xl border cursor-pointer transition-all ${stylePreference === style.id
                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-4 border border-white/10">
                    {React.cloneElement(style.icon, { className: 'h-6 w-6 text-purple-400' })}
                  </div>
                  <h4 className="text-lg font-display font-medium mb-2">{style.name}</h4>
                  <p className="text-gray-400 text-sm">{style.description}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-indigo-300 mb-1">AI Recommendation</h4>
                  <p className="text-gray-300 text-sm">Based on your current site, we recommend the <strong>Minimalist</strong> style for optimal user engagement and conversion rates.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleStyleSelection('minimalist')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-medium shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                Continue with AI Recommendation
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
                      {['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'].map((color) => (
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
                    src="https://placehold.co/800x600/1e293b/475569?text=Original+Website" 
                    alt="Original Website" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-4">Transformed Website</h4>
                <div className="aspect-video bg-white rounded-lg overflow-hidden">
                  <img 
                    src="https://placehold.co/800x600/e2e8f0/1e293b?text=Transformed+Website" 
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
                  <span>Applied Minimalist design style with clean typography</span>
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