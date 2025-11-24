'use client';

import { useState, useEffect } from 'react';
import AIAssistant from '../../components/AIAssistant';
import ApiKeySettings from '../../components/ApiKeySettings';
import VideoIntro from '../../components/VideoIntro';
import ScaryEffects from '../../components/ScaryEffects';
import BackgroundVideo from '../../components/BackgroundVideo';
import BugGraveyard from '../../components/BugGraveyard';
import DemoMode from '../../components/DemoMode';
import UndoRedoStack from '../../components/UndoRedoStack';
import ExportReport from '../../components/ExportReport';
import { Skull, Zap, Brain, Ghost, FolderOpen, Search, Plus } from 'lucide-react';

interface Repository {
  name: string;
  path: string;
}

interface ProjectFile {
  path: string;
  language: string;
  content?: string;
}

export default function AIDemoPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [loadingProject, setLoadingProject] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browseMode, setBrowseMode] = useState<'browse' | 'search'>('browse');
  const [currentPath, setCurrentPath] = useState('/');
  const [folders, setFolders] = useState<any[]>([]);
  const [searchPath, setSearchPath] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showBackgroundVideo, setShowBackgroundVideo] = useState(false);
  const [codeExpanded, setCodeExpanded] = useState(false);
  
  const [sampleCode, setSampleCode] = useState(`function addTodo() {
  const input = document.getElementById('todo-input');
  const button = document.getElementById('add-button');
  
  // BUG: Button is disabled
  button.disabled = true;
  button.setAttribute('disabled', 'disabled');
  
  if (input.value.trim()) {
    const todo = {
      id: Date.now(),
      text: input.value,
      completed: false
    };
    
    todos.push(todo);
    input.value = '';
    renderTodos();
  }
  
  // BUG: Prevents form submission
  event.preventDefault();
}`);

  const [language, setLanguage] = useState('javascript');
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [bugFixes, setBugFixes] = useState<any[]>([]);

  // Load repositories and check AI status
  useEffect(() => {
    // Check if AI is enabled - skip for now, assume enabled
    setAiEnabled(true);

    // Load repositories
    fetch('/api/repositories')
      .then(res => res.json())
      .then(data => {
        setRepositories(data);
        setLoadingRepos(false);
      })
      .catch(err => {
        console.error('Failed to load repositories:', err);
        setLoadingRepos(false);
      });


  }, []);

  const handleFixApplied = (fixedCode: string) => {
    const oldCode = sampleCode;
    setSampleCode(fixedCode);
    
    // Track the fix
    const newFix = {
      file: selectedFile || 'sample-code.js',
      severity: 'medium',
      description: 'Bug fixed by AI',
      before: oldCode,
      after: fixedCode,
      timeSaved: 15,
      timestamp: new Date()
    };
    setBugFixes(prev => [...prev, newFix]);
    
    // Emit events for other components
    window.dispatchEvent(new CustomEvent('bugFixed', {
      detail: { severity: 'medium', timeSaved: 15, file: selectedFile || 'sample-code.js' }
    }));
    
    window.dispatchEvent(new CustomEvent('codeChange', {
      detail: { action: 'Bug Fixed', file: selectedFile, before: oldCode, after: fixedCode }
    }));
  };

  const handleLoadProject = async () => {
    if (!selectedProject) return;
    await loadProjectFiles(selectedProject);
  };

  const handleSelectFile = async (filePath: string) => {
    if (!filePath) return;
    
    console.log('Selecting file:', filePath);
    setSelectedFile(filePath);
    
    try {
      // Read file content via API
      console.log('Reading file via API:', filePath);
      const response = await fetch('/api/read-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      
      console.log('Read file response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Read file error:', errorData);
        throw new Error(errorData.error || 'Failed to read file');
      }
      
      const data = await response.json();
      console.log('File content length:', data.content?.length || 0);
      setSampleCode(data.content);
      
      // Detect language from file extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yaml'
      };
      setLanguage(langMap[ext || ''] || 'javascript');
      console.log('File loaded successfully, language:', langMap[ext || ''] || 'javascript');
    } catch (error) {
      console.error('Failed to read file:', error);
      alert('Failed to read file: ' + (error as Error).message + '\n\nFile path: ' + filePath);
    }
  };

  const handleBrowse = async (path: string) => {
    try {
      const response = await fetch(`/api/browse?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      
      // Convert folder names to objects with name and path
      const folderObjects = (data.folders || []).map((folderName: string) => ({
        name: folderName,
        path: path === '/' ? `/${folderName}` : `${path}/${folderName}`
      }));
      
      setFolders(folderObjects);
      setCurrentPath(path);
    } catch (error) {
      console.error('Browse error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchPath.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch('/api/search-repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchPath })
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFolder = async (folderPath: string) => {
    try {
      // Add to repositories
      await fetch('/api/add-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath })
      });
      
      // Reload repositories
      const response = await fetch('/api/repositories');
      const data = await response.json();
      setRepositories(data);
      
      // Select this project
      setSelectedProject(folderPath);
      setShowBrowser(false);
      
      // Auto-load the project with the correct path
      await loadProjectFiles(folderPath);
    } catch (error) {
      console.error('Failed to add project:', error);
      alert('Failed to add project: ' + (error as Error).message);
    }
  };

  const loadProjectFiles = async (projectPath: string) => {
    if (!projectPath) {
      console.error('No project path provided');
      return;
    }
    
    console.log('Loading project:', projectPath);
    setLoadingProject(true);
    
    try {
      // Scan the project to get all files
      console.log('Scanning project at:', projectPath);
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath })
      });
      
      console.log('Scan response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Scan failed:', errorText);
        throw new Error(`Failed to scan project: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Scan data:', data);
      
      if (!data.issues || data.issues.length === 0) {
        alert('No files found in this project. Try selecting a different folder with code files.');
        return;
      }
      
      const files = data.issues.map((issue: any) => ({
        path: `${projectPath}/${issue.file}`,
        language: issue.language
      }));
      
      // Remove duplicates
      const uniqueFiles = Array.from(
        new Map(files.map((f: ProjectFile) => [f.path, f])).values()
      ) as ProjectFile[];
      
      console.log('Found files:', uniqueFiles.length);
      setProjectFiles(uniqueFiles);
      
      // Auto-select first file
      if (uniqueFiles.length > 0) {
        await handleSelectFile(uniqueFiles[0].path);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project: ' + (error as Error).message);
    } finally {
      setLoadingProject(false);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem('welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  };

  const handleWelcomeClose = () => {
    localStorage.setItem('welcome_seen', 'true');
    setShowWelcome(false);
  };

  if (showSplash) {
    return <VideoIntro onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen p-8" style={{
      backgroundImage: 'url(/images/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.2)',
        zIndex: 0
      }} />
      <BackgroundVideo trigger={showBackgroundVideo} />
      <div className="max-w-7xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-5xl font-bold" style={{
              fontFamily: 'Georgia, serif',
              color: '#d4d4d4',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              letterSpacing: '2px'
            }}>
              BugReaper AI
            </h1>
          </div>
          <p className="text-xl mb-4" style={{
            color: '#a0a0a0',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic'
          }}>
            Haunting bugs with AI-powered spectral analysis
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <DemoMode
              onSelectDemo={(code, lang) => {
                setSampleCode(code);
                setLanguage(lang);
                setCodeExpanded(true);
              }}
            />
            <ExportReport fixes={bugFixes} projectName={selectedProject || 'Demo Project'} />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div style={{
            background: 'rgba(50, 50, 50, 0.6)',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)'
          }} className="rounded-lg p-6 text-center">
            <h3 className="font-bold mb-1" style={{ color: '#d4d4d4', fontFamily: 'Georgia, serif' }}>Death to Bugs</h3>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>AI reaps complex bugs instantly</p>
          </div>
          <div style={{
            background: 'rgba(50, 50, 50, 0.6)',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)'
          }} className="rounded-lg p-6 text-center">
            <h3 className="font-bold mb-1" style={{ color: '#d4d4d4', fontFamily: 'Georgia, serif' }}>Undead Review</h3>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>Resurrect code quality</p>
          </div>
          <div style={{
            background: 'rgba(50, 50, 50, 0.6)',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)'
          }} className="rounded-lg p-6 text-center">
            <h3 className="font-bold mb-1" style={{ color: '#d4d4d4', fontFamily: 'Georgia, serif' }}>Tomb Tests</h3>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>Summon comprehensive tests</p>
          </div>
          <div style={{
            background: 'rgba(50, 50, 50, 0.6)',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)'
          }} className="rounded-lg p-6 text-center">
            <h3 className="font-bold mb-1" style={{ color: '#d4d4d4', fontFamily: 'Georgia, serif' }}>Ghostly Wisdom</h3>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>Decode cursed code</p>
          </div>
        </div>

        {/* Project Selector */}
        <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center gap-4">
            <FolderOpen className="w-6 h-6 text-yellow-400" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Select Your Project
              </label>
              {loadingRepos ? (
                <div className="text-purple-200">Loading projects...</div>
              ) : repositories.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-gray-900 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Use sample code below</option>
                    {repositories.map((repo) => (
                      <option key={repo.path} value={repo.path}>
                        {repo.name} - {repo.path}
                      </option>
                    ))}
                  </select>
                  {selectedProject && (
                    <button
                      onClick={async () => {
                        if (confirm(`Remove "${selectedProject}" from the list?`)) {
                          try {
                            await fetch('/api/remove-project', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ path: selectedProject })
                            });
                            const response = await fetch('/api/repositories');
                            const data = await response.json();
                            setRepositories(data);
                            setSelectedProject('');
                            setProjectFiles([]);
                            setSelectedFile('');
                          } catch (error) {
                            console.error('Failed to remove project:', error);
                          }
                        }
                      }}
                      className="text-sm text-red-400 hover:text-red-300 underline"
                    >
                      Remove selected project
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-purple-200">
                  No projects yet. Click "Browse" or "Search" to add one.
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowBrowser(true);
                  setBrowseMode('browse');
                  handleBrowse('/');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <FolderOpen className="w-5 h-5 inline mr-2" />
                Browse
              </button>
              <button
                onClick={() => {
                  setShowBrowser(true);
                  setBrowseMode('search');
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                <Search className="w-5 h-5 inline mr-2" />
                Search
              </button>
              {selectedProject && (
                <button
                  onClick={handleLoadProject}
                  disabled={loadingProject}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {loadingProject ? 'Loading...' : 'Load Files'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Folder Browser Modal */}
        {showBrowser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {browseMode === 'browse' ? 'Browse Folders' : 'Search Projects'}
                  </h2>
                  <button
                    onClick={() => setShowBrowser(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setBrowseMode('browse')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      browseMode === 'browse'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4 inline mr-2" />
                    Browse
                  </button>
                  <button
                    onClick={() => setBrowseMode('search')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      browseMode === 'search'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Search className="w-4 h-4 inline mr-2" />
                    Search
                  </button>
                </div>

                {browseMode === 'browse' ? (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Current: {currentPath}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const parent = currentPath.split('/').slice(0, -1).join('/') || '/';
                          handleBrowse(parent);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        ← Up
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchPath}
                      onChange={(e) => setSearchPath(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Enter path to search (e.g., /Users/yourname/projects)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={searching}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 overflow-y-auto max-h-96">
                {browseMode === 'browse' ? (
                  <div className="space-y-2">
                    {folders.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">No folders found</div>
                    ) : (
                      folders.map((folder) => (
                        <div
                          key={folder.path}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">{folder.name}</div>
                              <div className="text-sm text-gray-500">{folder.path}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBrowse(folder.path)}
                              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => handleSelectFolder(folder.path)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              <Plus className="w-4 h-4 inline mr-1" />
                              Select
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">
                        {searching ? 'Searching...' : 'Enter a path and click Search'}
                      </div>
                    ) : (
                      searchResults.map((repo) => (
                        <div
                          key={repo.path}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-5 h-5 text-indigo-600" />
                            <div>
                              <div className="font-medium text-gray-900">{repo.name}</div>
                              <div className="text-sm text-gray-500">{repo.path}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSelectFolder(repo.path)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Plus className="w-4 h-4 inline mr-1" />
                            Select
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* File Selector (appears after loading project) */}
        {projectFiles.length > 0 && (
          <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Select File to Analyze ({projectFiles.length} files found)
            </label>
            <select
              value={selectedFile}
              onChange={(e) => handleSelectFile(e.target.value)}
              className="w-full px-4 py-3 bg-white text-gray-900 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Choose a file...</option>
              {projectFiles.map((file) => (
                <option key={file.path} value={file.path}>
                  {file.path} ({file.language})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code Editor */}
          <div className="rounded-lg p-6" style={{
            background: 'rgba(50, 50, 50, 0.6)',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCodeExpanded(!codeExpanded)}
                className="px-6 py-3 rounded-lg font-semibold transition-all"
                style={{
                  background: codeExpanded ? 'rgba(100, 100, 100, 0.5)' : 'rgba(150, 150, 150, 0.6)',
                  border: '1px solid rgba(200, 200, 200, 0.3)',
                  color: '#d4d4d4',
                  fontFamily: 'Georgia, serif',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}
              >
                {codeExpanded ? 'Hide Code' : 'Show Code'}
              </button>
              {codeExpanded && (
                <select
                  value={language}
                  onChange={(e) => {
                    e.stopPropagation();
                    setLanguage(e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-2 rounded-md"
                  style={{
                    background: 'rgba(100, 100, 100, 0.5)',
                    border: '1px solid rgba(200, 200, 200, 0.3)',
                    color: '#d4d4d4'
                  }}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </select>
              )}
            </div>
            {codeExpanded && (
              <>
                <textarea
                  value={sampleCode}
                  onChange={(e) => setSampleCode(e.target.value)}
                  className="w-full h-96 px-4 py-3 font-mono text-sm rounded-lg focus:outline-none"
                  style={{
                    background: 'rgba(20, 20, 20, 0.8)',
                    color: '#4ade80',
                    border: '1px solid rgba(200, 200, 200, 0.2)'
                  }}
                  spellCheck={false}
                />
                <div className="mt-4 text-sm" style={{ color: '#a0a0a0' }}>
                  💡 Try editing the code or paste your own buggy code!
                </div>
              </>
            )}
          </div>

          {/* AI Assistant */}
          <AIAssistant
            code={sampleCode}
            language={language}
            filePath={selectedFile || undefined}
            onFixApplied={handleFixApplied}
            onAutoReapClick={() => setShowBackgroundVideo(true)}
          />
        </div>

        {/* How It Works */}
        <div className="mt-12 rounded-lg p-8" style={{
          background: 'rgba(50, 50, 50, 0.6)',
          border: '1px solid rgba(200, 200, 200, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 className="text-3xl font-bold mb-6 text-center" style={{
            fontFamily: 'Georgia, serif',
            color: '#d4d4d4',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '1px'
          }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{
                background: 'rgba(100, 100, 100, 0.5)',
                color: '#d4d4d4',
                border: '2px solid rgba(200, 200, 200, 0.3)',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}>
                1
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#d4d4d4', fontFamily: 'Georgia, serif' }}>Describe the Bug</h3>
              <p style={{ color: '#a0a0a0' }}>
                Tell the AI what's haunting your code
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{
                background: 'rgba(100, 100, 100, 0.5)',
                color: '#d4d4d4',
                border: '2px solid rgba(200, 200, 200, 0.3)',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}>
                2
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#d4d4d4', fontFamily: 'Georgia, serif' }}>AI Analyzes</h3>
              <p style={{ color: '#a0a0a0' }}>
                Spectral intelligence finds the fix
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{
                background: 'rgba(100, 100, 100, 0.5)',
                color: '#d4d4d4',
                border: '2px solid rgba(200, 200, 200, 0.3)',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)'
              }}>
                3
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#d4d4d4', fontFamily: 'Georgia, serif' }}>Apply & Vanish</h3>
              <p style={{ color: '#a0a0a0' }}>
                The bug disappears into the mist
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg p-6 text-center" style={{
            background: 'rgba(50, 50, 50, 0.6)',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="text-4xl font-bold mb-2" style={{ 
              color: '#d4d4d4',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Georgia, serif'
            }}>99%</div>
            <div style={{ color: '#a0a0a0' }}>Faster than manual fixing</div>
          </div>
          <div className="rounded-lg p-6 text-center" style={{
            background: 'rgba(50, 50, 50, 0.6)',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="text-4xl font-bold mb-2" style={{ 
              color: '#d4d4d4',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Georgia, serif'
            }}>98%</div>
            <div style={{ color: '#a0a0a0' }}>Fix success rate</div>
          </div>
          <div className="rounded-lg p-6 text-center" style={{
            background: 'rgba(50, 50, 50, 0.6)',
            border: '1px solid rgba(200, 200, 200, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="text-4xl font-bold mb-2" style={{ 
              color: '#d4d4d4',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'Georgia, serif'
            }}>9+</div>
            <div style={{ color: '#a0a0a0' }}>Languages supported</div>
          </div>
        </div>
      </div>

      {/* API Key Settings */}
      <ApiKeySettings />
      
      {/* Bug Graveyard Dashboard */}
      <BugGraveyard />
      
      {/* Undo/Redo Stack */}
      <UndoRedoStack
        onUndo={(entry) => {
          setSampleCode(entry.before);
          console.log('Undoing:', entry.action);
        }}
        onRedo={(entry) => {
          setSampleCode(entry.after);
          console.log('Redoing:', entry.action);
        }}
      />
      
      {/* Scary Effects */}
      <ScaryEffects 
        enableGhosts={false}
        enableCracks={false}
        enableGlitch={false}
      />

      {/* Welcome Dialog */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full border border-purple-500/30 p-8">
            <h2 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
              👋 Welcome to BugReaper!
            </h2>
            
            <div className="space-y-4 text-lg text-gray-300 mb-8">
              <p className="flex items-start gap-3">
                <span className="text-2xl">🔑</span>
                <span>
                  <strong className="text-white">To use AI features,</strong> click the purple key icon in the bottom right corner and enter your free Gemini API key.
                </span>
              </p>
              
              <p className="text-gray-400 ml-11">
                Get one at: <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  https://makersuite.google.com/app/apikey
                </a>
              </p>
              
              <p className="text-gray-400 ml-11">
                (Takes 2 minutes, completely free!)
              </p>
            </div>

            <button
              onClick={handleWelcomeClose}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
