import { useState } from 'react';
import githubAIService from '../services/githubAIService';
import { Code, RefreshCw, AlertTriangle, Cpu, FileCheck, TestTube } from 'lucide-react';

// Define the tools offered by the code assistant
type ToolType = 'analyze' | 'implement' | 'refactor' | 'security' | 'review' | 'test';

const CodeAssistantPanel = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('analyze');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [goals, setGoals] = useState('');
  const [requirements, setRequirements] = useState('');
  const [testFramework, setTestFramework] = useState('jest');
  const [language, setLanguage] = useState('typescript');
  const [useAdvancedModel, setUseAdvancedModel] = useState(false);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult('');

    try {
      let response: string;

      switch (activeTool) {
        case 'analyze':
          response = await githubAIService.analyzeCodeError(code, errorMessage, language, useAdvancedModel);
          break;
        case 'implement':
          response = await githubAIService.generateImplementation(description, context, language, useAdvancedModel);
          break;
        case 'refactor':
          response = await githubAIService.refactorCode(code, goals, language, useAdvancedModel);
          break;
        case 'security':
          response = await githubAIService.analyzeCodeSecurity(code, language, useAdvancedModel);
          break;
        case 'review':
          response = await githubAIService.reviewCode(code, requirements, language, useAdvancedModel);
          break;
        case 'test':
          response = await githubAIService.generateTests(code, testFramework, language, useAdvancedModel);
          break;
        default:
          response = 'Invalid tool selected';
      }

      setResult(response);
    } catch (error) {
      console.error('Error using GitHub AI:', error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolForm = () => {
    switch (activeTool) {
      case 'analyze':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code with Error
              </label>
              <textarea
                className="w-full h-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error Message
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-24"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Paste the error message here..."
              />
            </div>
          </div>
        );
      
      case 'implement':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feature Description
              </label>
              <textarea
                className="w-full h-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the functionality you want to implement..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-24"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Provide any additional context about your project..."
              />
            </div>
          </div>
        );
      
      case 'refactor':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code to Refactor
              </label>
              <textarea
                className="w-full h-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refactoring Goals
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-24"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Describe your refactoring goals (e.g., improve performance, readability, etc.)..."
              />
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code to Analyze for Security
              </label>
              <textarea
                className="w-full h-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here for security analysis..."
              />
            </div>
          </div>
        );
      
      case 'review':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code to Review
              </label>
              <textarea
                className="w-full h-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here for review..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements (optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-24"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe the requirements this code should meet..."
              />
            </div>
          </div>
        );
      
      case 'test':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code to Generate Tests For
              </label>
              <textarea
                className="w-full h-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Framework
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={testFramework}
                onChange={(e) => setTestFramework(e.target.value)}
              >
                <option value="jest">Jest</option>
                <option value="mocha">Mocha</option>
                <option value="vitest">Vitest</option>
                <option value="jasmine">Jasmine</option>
              </select>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">GitHub AI Code Assistant</h2>
      
      {/* Tool Selection Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTool === 'analyze' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTool('analyze')}
        >
          <AlertTriangle className="h-4 w-4" />
          Error Analysis
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTool === 'implement' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTool('implement')}
        >
          <Code className="h-4 w-4" />
          Code Generation
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTool === 'refactor' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTool('refactor')}
        >
          <RefreshCw className="h-4 w-4" />
          Refactoring
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTool === 'security' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTool('security')}
        >
          <AlertTriangle className="h-4 w-4" />
          Security Analysis
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTool === 'review' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTool('review')}
        >
          <FileCheck className="h-4 w-4" />
          Code Review
        </button>
        <button
          className={`px-4 py-2 -mb-px font-medium text-sm flex items-center gap-2 ${
            activeTool === 'test' 
              ? 'text-indigo-600 border-b-2 border-indigo-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTool('test')}
        >
          <TestTube className="h-4 w-4" />
          Test Generation
        </button>
      </div>
      
      {/* Language Selection */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programming Language
          </label>
          <select
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="ruby">Ruby</option>
            <option value="php">PHP</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Model
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-indigo-600"
                name="model"
                checked={!useAdvancedModel}
                onChange={() => setUseAdvancedModel(false)}
              />
              <span className="ml-2">O4 Mini (Faster)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-indigo-600"
                name="model"
                checked={useAdvancedModel}
                onChange={() => setUseAdvancedModel(true)}
              />
              <span className="ml-2">GPT-4.1 (More Powerful)</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Dynamic Form */}
      <div className="mb-6">
        {renderToolForm()}
      </div>
      
      {/* Submit Button */}
      <div className="mb-8">
        <button
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Cpu className="inline mr-2 h-5 w-5" />
              {activeTool === 'analyze' ? 'Analyze Error' :
               activeTool === 'implement' ? 'Generate Code' :
               activeTool === 'refactor' ? 'Refactor Code' :
               activeTool === 'security' ? 'Analyze Security' :
               activeTool === 'review' ? 'Review Code' : 'Generate Tests'}
            </>
          )}
        </button>
      </div>
      
      {/* Results */}
      {result && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Results</h3>
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-md">
            <div className="mb-2 text-xs text-gray-500">
              Using model: {useAdvancedModel ? 'GPT-4.1' : 'O4 Mini'}
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {result}
            </pre>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-xs text-gray-500 text-center">
        Powered by GitHub AI Models • Requires a GitHub Personal Access Token with models:read permission
      </div>
    </div>
  );
};

export default CodeAssistantPanel; 