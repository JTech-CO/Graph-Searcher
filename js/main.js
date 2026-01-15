import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM;

const GlitchText = ({ text }) => {
    return (
        <div className="relative inline-block group">
            <span className="relative z-10">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-cyan-500 opacity-0 group-hover:opacity-70 group-hover:translate-x-[2px] transition-all duration-75">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-red-500 opacity-0 group-hover:opacity-70 group-hover:-translate-x-[2px] transition-all duration-75">{text}</span>
        </div>
    );
};

const SourceNode = ({ source, index }) => {
  let hostname = "Source";
  try {
     hostname = new URL(source.uri).hostname.replace('www.', '');
  } catch (e) {}
  
  return (
    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="block group relative p-3 border border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all duration-300">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-600 group-hover:border-cyan-400 transition-colors"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-600 group-hover:border-cyan-400 transition-colors"></div>
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-700 text-cyan-400 font-mono text-xs rounded-sm group-hover:bg-cyan-900/30 transition-colors">
                {index + 1}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-xs text-cyan-500/80 mb-0.5 font-mono uppercase tracking-wider">{hostname}</div>
                <div className="text-sm text-slate-200 font-medium truncate group-hover:text-cyan-50 transition-colors">{source.title}</div>
            </div>
            <i className="fas fa-external-link-alt text-[10px] text-slate-500 group-hover:text-cyan-400 mt-1"></i>
        </div>
    </a>
  );
};

const ConfigModal = ({ config, onSave }) => {
    const [localKey, setLocalKey] = useState(config?.geminiKey || '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-cyan-500/30 p-8 max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.1)] relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>
                <h2 className="text-xl font-bold text-cyan-400 mb-6 tracking-widest font-mono">
                    <i className="fas fa-cog animate-spin-slow mr-2"></i> SYSTEM_INIT
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-cyan-500/80 mb-1">GEMINI_API_KEY (REQUIRED)</label>
                        <input type="password" 
                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 font-mono focus:border-cyan-500 focus:outline-none transition-colors"
                            value={localKey}
                            onChange={e => setLocalKey(e.target.value)}
                            placeholder="Paste API Key here..."
                        />
                    </div>
                    <button onClick={() => onSave({ geminiKey: localKey })} disabled={!localKey}
                        className="w-full mt-6 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-500/50 py-3 font-mono text-sm tracking-wider uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        Initialize System
                    </button>
                </div>
            </div>
        </div>
    );
};

const App = () => {
  const [config, setConfig] = useState(null);
  const [showConfig, setShowConfig] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState({ status: 'idle', query: '', resultText: '', sources: [] });
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sessionId, setSessionId] = useState(Math.random().toString(36).substr(2, 9).toUpperCase());

  useEffect(() => {
    const saved = localStorage.getItem('graph_searcher_config');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            setConfig({ geminiKey: parsed.geminiKey });
            setShowConfig(false);
        } catch (e) { console.error(e); }
    }
  }, []);

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem('graph_searcher_config', JSON.stringify(newConfig));
    setShowConfig(false);
  };

  const initiateSearch = () => {
     if (!inputValue.trim() || !config) return;
     if (state.status === 'searching') return;

     setState({
        status: 'selecting_depth',
        query: inputValue,
        resultText: '',
        sources: []
     });
  };

  const executeSearch = async (depthMode) => {
    setSessionId(Math.random().toString(36).substr(2, 9).toUpperCase());
    
    setState(prev => ({ ...prev, status: 'searching' }));
    setFilterRegion('all');
    setFilterType('all');

    try {
      const genAI = new GoogleGenerativeAI(config.geminiKey);
      const modelName = depthMode === 'summary' ? "gemini-2.5-flash" : "gemini-2.5-pro";
      
      const model = genAI.getGenerativeModel({ 
          model: modelName,
          tools: [{ googleSearch: {} }]
      });

      let systemInstructionText = "";
      if (depthMode === 'summary') {
         systemInstructionText = "You are Graph Searcher. Provide a concise executive summary of the requested data. Focus ONLY on the most critical numbers, key trends, and final conclusions. Keep it brief, high-level, and easy to read quickly. Avoid excessive detail.";
      } else {
         systemInstructionText = "You are Graph Searcher, a specialized analytical engine. Your goal is to find quantitative data, trends, and statistical information. Provide answers in a comprehensive, technical, report-like format. Focus deeply on numbers, data points, relationships, and provide detailed explanations.";
      }

      const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: state.query }]}],
        systemInstruction: systemInstructionText
      });

      let fullText = "";
      let finalSources = [];

      for await (const chunk of result.stream) {
        const textChunk = chunk.text();
        if (textChunk) fullText += textChunk;

        if (chunk.candidates && chunk.candidates[0]?.groundingMetadata?.groundingChunks) {
            const chunks = chunk.candidates[0].groundingMetadata.groundingChunks;
            const newSources = chunks
                .filter(c => c.web)
                .map(c => ({ title: c.web.title || "Data Source", uri: c.web.uri }));
            
            if (newSources.length > 0) {
                 finalSources = [...finalSources, ...newSources].filter((v,i,a)=>a.findIndex(v2=>(v2.uri===v.uri))===i);
                 setState(prev => ({ ...prev, sources: finalSources }));
            }
        }
        setState(prev => ({ ...prev, resultText: fullText }));
      }
      setState(prev => ({ ...prev, status: 'complete' }));

    } catch (error) {
      console.error("Search error:", error);
      setState(prev => ({ ...prev, status: 'error', resultText: `System Error: ${error.message || 'Check API Key or Network'}` }));
    }
  };

  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*|\[\d+\])/g);
        return (
            <div key={i} className="min-h-[1.5em] break-words">
                {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="text-cyan-400 font-bold">{part.slice(2, -2)}</strong>;
                    if (/^\[\d+\]$/.test(part)) return <span key={j} className="text-cyan-500/80 text-xs align-super ml-0.5">{part}</span>;
                    return part;
                })}
            </div>
        );
    });
  };

  const getSourceInfo = (source) => {
    const text = (source.title + source.uri).toLowerCase();
    const isGraph = ['graph', 'chart', 'stat', 'trend', 'data', 'diagram', '지표', '통계', '차트', '추이', '그래프'].some(k => text.includes(k));
    const isTable = ['table', 'list', 'rank', 'schedule', 'grid', 'matrix', '표', '순위', '목록'].some(k => text.includes(k));
    const isNews = ['news', 'times', 'daily', 'report', 'press', '뉴스', '일보', '기사', '신문', 'journal'].some(k => text.includes(k));
    const hasKoreanChar = /[\u3131-\uD79D\uAC00-\uD7A3]/.test(source.title);
    const isKrDomain = /\.kr(\/|$)/.test(source.uri);
    const isDomestic = isKrDomain || hasKoreanChar;
    
    return { isGraph, isTable, isNews, isDomestic };
  };

  const filteredSources = state.sources.filter(s => {
      const info = getSourceInfo(s);
      if (filterRegion === 'domestic' && !info.isDomestic) return false;
      if (filterRegion === 'international' && info.isDomestic) return false;
      if (filterType === 'graph' && !info.isGraph) return false;
      if (filterType === 'table' && !info.isTable) return false;
      if (filterType === 'news' && !info.isNews) return false;
      return true;
  });

  return (
    <div className="relative h-screen w-full graph-bg flex flex-col overflow-hidden">
      {showConfig && <ConfigModal config={config} onSave={handleSaveConfig} />}
      <div className="axis-x"></div>
      <div className="axis-y"></div>
      
      <header className="flex-none z-10 w-full max-w-7xl mx-auto p-6 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold tracking-tighter text-slate-100">
                <i className="fas fa-chart-line text-cyan-400 mr-3"></i>
                <GlitchText text="GRAPH_SEARCHER" />
            </h1>
            <div className="text-xs text-slate-500 font-mono mt-1 pl-1">POWERED BY GEMINI 2.5</div>
        </div>
        <button onClick={() => setShowConfig(true)} className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-1 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 transition-colors font-mono uppercase">
            <i className="fas fa-sliders-h mr-1"></i> CONFIG
        </button>
      </header>

      <main className={`flex-1 flex flex-col z-10 w-full max-w-7xl mx-auto px-4 min-h-0 transition-all duration-500 ease-in-out ${state.status === 'idle' ? 'justify-center pb-[20vh]' : 'pt-2'}`}>
        
        <div className="flex-none relative group max-w-4xl mx-auto w-full mb-4">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-none blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 border border-slate-700 flex items-center p-2 shadow-2xl">
                <div className="px-3 text-cyan-500 font-mono text-lg animate-pulse">{`>`}</div>
                <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyDown={(e) => e.key === "Enter" && initiateSearch()} 
                    placeholder="Enter mathematical query or data request..." 
                    className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono placeholder-slate-600 h-10" 
                    autoFocus 
                    disabled={state.status === 'selecting_depth' || state.status === 'searching'}
                />
                <button 
                    onClick={initiateSearch} 
                    disabled={state.status === 'searching' || state.status === 'selecting_depth' || !inputValue.trim()} 
                    className="px-6 py-2 bg-slate-800 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-slate-700 hover:border-cyan-500 transition-all font-mono text-sm tracking-wider uppercase disabled:opacity-50"
                >
                    {state.status === 'searching' ? 'SCANNING...' : 'EXECUTE'}
                </button>
            </div>
        </div>

        {(state.status !== 'idle') && (
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up pb-10">
                <div className="md:col-span-2 h-full flex flex-col min-h-0">
                    <div className="bg-slate-900/80 border border-slate-700 backdrop-blur-sm p-1 relative h-full flex flex-col">
                        <div className="flex-none bg-slate-800/50 px-4 py-2 flex justify-between items-center border-b border-slate-700">
                            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Analysis_Log</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed text-slate-300 scrollbar-thin relative">
                            {state.status === 'selecting_depth' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20">
                                    <div className="text-cyan-400 font-mono mb-6 animate-pulse text-lg tracking-widest">
                                        >> SELECT_RESOLUTION_LAYER
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => executeSearch('summary')}
                                            className="group relative px-8 py-4 bg-slate-800 border border-cyan-500/30 hover:bg-cyan-900/20 hover:border-cyan-400 transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
                                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>
                                            <div className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 mb-1">SUMMARY</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wide">GEMINI 2.5 FLASH</div>
                                        </button>

                                        <button 
                                            onClick={() => executeSearch('deep')}
                                            className="group relative px-8 py-4 bg-slate-800 border border-purple-500/30 hover:bg-purple-900/20 hover:border-purple-400 transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500"></div>
                                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500"></div>
                                            <div className="text-lg font-bold text-slate-200 group-hover:text-purple-400 mb-1">DEEP SCAN</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wide">GEMINI 2.5 PRO</div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {state.status === 'searching' && !state.resultText && (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                                    <div className="text-cyan-500 animate-pulse text-xs">ACQUIRING DATA STREAMS...</div>
                                </div>
                            )}

                            <div className="markdown-body">
                                {formatText(state.resultText)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="md:col-span-1 h-full flex flex-col min-h-0">
                    <div className="bg-slate-900/80 border border-slate-700 backdrop-blur-sm relative h-full flex flex-col">
                        <div className="flex-none bg-slate-800/50 px-4 py-2 border-b border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Nodes ({filteredSources.length})</span>
                            </div>
                            <div className="flex gap-1 mb-1">
                                {['all', 'domestic', 'international'].map(r => (
                                    <button key={r} onClick={() => setFilterRegion(r)} className={`flex-1 text-[9px] font-mono uppercase py-1 border ${filterRegion === r ? 'bg-cyan-900/40 text-cyan-300 border-cyan-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>{r === 'international' ? 'GLOBAL' : r === 'domestic' ? 'KOREA' : 'ALL'}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                            {filteredSources.map((source, idx) => <SourceNode key={idx} source={source} index={idx} />)}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>
      
      <footer className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 p-2 z-20 text-[10px] font-mono text-slate-500 text-center">
          SESSION_ID: {sessionId}
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
