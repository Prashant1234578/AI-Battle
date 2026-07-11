import React, { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from './components/MarkdownRenderer';
import './App.css';

// SVG Icons as React Components to avoid dependency issues
const Icons = {
  Plus: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Send: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  Sparkles: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.096.813zM18.625 8.625L18 12l-.625-3.375L14 8l3.375-.625L18 4l.625 3.375L22 8l-3.375.625z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Terminal: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Cpu: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  ),
  History: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Message: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
};

const SUGGESTED_PROMPTS = [
  "Write a responsive React navigation bar with Tailwind CSS",
  "Implement a fast binary search algorithm in JavaScript",
  "Write a utility function to deep-clone an object in TypeScript",
  "Create an elegant CSS glassmorphic card layout"
];

function App() {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('battle_sessions');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Factorial function JS', messages: [] }
    ];
  });
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem('battle_active_session_id');
    return saved || '1';
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('battle_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('battle_active_session_id', activeSessionId);
  }, [activeSessionId]);

  // Scroll to bottom on new messages
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize input textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleNewSession = () => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: 'New Battle',
      messages: []
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setInput('');
    setError(null);
  };

  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    if (filtered.length === 0) {
      const defaultSession = { id: Date.now().toString(), title: 'New Battle', messages: [] };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
    } else {
      setSessions(filtered);
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  const handleSend = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || loading) return;

    setInput('');
    setLoading(true);
    setError(null);

    // Update session title if it's currently default
    let updatedSessions = [...sessions];
    const sessionIdx = updatedSessions.findIndex(s => s.id === activeSessionId);
    if (sessionIdx !== -1 && updatedSessions[sessionIdx].title === 'New Battle') {
      const truncatedTitle = promptText.length > 25 ? promptText.substring(0, 25) + '...' : promptText;
      updatedSessions[sessionIdx].title = truncatedTitle;
    }

    // Add temporary message skeleton
    const userMsgId = Date.now().toString();
    const tempUserMsg = {
      id: userMsgId,
      problem: promptText,
      solution_1: '',
      solution_2: '',
      judge: null,
      isPending: true
    };

    if (sessionIdx !== -1) {
      updatedSessions[sessionIdx].messages = [...updatedSessions[sessionIdx].messages, tempUserMsg];
      setSessions(updatedSessions);
    }

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problem: promptText }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();

      // Update the temporary message with the real results
      setSessions(prevSessions => {
        return prevSessions.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => {
                if (m.id === userMsgId) {
                  return {
                    id: userMsgId,
                    problem: promptText,
                    solution_1: data.solution_1 || 'No solution generated by Mistral.',
                    solution_2: data.solution_2 || 'No solution generated by Cohere.',
                    judge: data.judge ? {
                      solution_1_score: data.judge.solution_1_score ?? 0,
                      solution_2_score: data.judge.solution_2_score ?? 0,
                      solution_1_reasoning: data.judge.solution_1_reasoning || data.judge.solution_1_resoning || 'No reasoning provided.',
                      solution_2_reasoning: data.judge.solution_2_reasoning || data.judge.solution_2_resoning || 'No reasoning provided.'
                    } : null,
                    isPending: false
                  };
                }
                return m;
              })
            };
          }
          return s;
        });
      });

    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect to the AI Judge server. Please verify the backend is running on http://localhost:3000.");

      // Remove the pending message on failure
      setSessions(prevSessions => {
        return prevSessions.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.filter(m => m.id !== userMsgId)
            };
          }
          return s;
        });
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Nav */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950 flex flex-col shrink-0">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-900 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Icons.Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">AI Battle Arena</h1>
            <span className="text-[10px] font-mono text-slate-500 tracking-wider">v1.0 • Desktop</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-sm font-semibold rounded-md transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <Icons.Plus />
            <span>New Battle</span>
          </button>
        </div>

        {/* Navigation History */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Icons.History />
            <span>Battle History</span>
          </div>

          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  setError(null);
                }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer ${isActive
                    ? 'bg-slate-900 text-white border-l-2 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                  }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Icons.Message />
                  <span className="truncate">{s.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity rounded"
                >
                  <Icons.Trash />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900/60 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Active Sessions</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
            {sessions.length}
          </span>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden relative">
        {/* Header bar */}
        <header className="h-16 border-b border-slate-900 px-8 flex items-center justify-between shrink-0 bg-slate-950/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20 animate-pulse"></div>
            <h2 className="text-sm font-semibold text-slate-200">
              {activeSession ? activeSession.title : 'AI Chat Battle'}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="bg-slate-900 border border-slate-850 px-2 py-1 rounded">Mistral Medium</span>
            <span className="text-slate-600">vs</span>
            <span className="bg-slate-900 border border-slate-850 px-2 py-1 rounded">Cohere Command</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Icons.Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Gemini Judge
            </span>
          </div>
        </header>

        {/* Chat Stream Panel */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-12">
          {messages.length === 0 && !loading ? (
            /* Welcome / Empty state */
            <div className="max-w-4xl mx-auto py-16 flex flex-col items-center text-center space-y-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center shadow-inner relative group">
                <Icons.Sparkles className="w-8 h-8 text-blue-500" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
              </div>
              <div className="space-y-3 max-w-lg">
                <h3 className="text-xl font-bold tracking-tight text-white">Compare Models Side-by-Side</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Enter your coding task or logic problem. We will query two distinct AI models in parallel, then submit both responses to Gemini for scoring and reasoning.
                </p>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full pt-4">
                {SUGGESTED_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="p-4 text-left border border-slate-900 hover:border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 rounded-lg text-xs sm:text-sm text-slate-300 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Flow Items */
            <div className="max-w-6xl mx-auto space-y-12 pb-24">
              {messages.map((m) => (
                <div key={m.id} className="space-y-6">
                  {/* User Message Bubble */}
                  <div className="flex justify-end">
                    <div className="bg-slate-900 border border-slate-850 rounded-lg py-3.5 px-5 max-w-[80%] text-slate-100 text-sm sm:text-base shadow-sm">
                      {m.problem}
                    </div>
                  </div>

                  {/* Pending Skeleton Loader */}
                  {m.isPending ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Solution 1 Loader */}
                        <div className="bg-slate-900/40 rounded-lg border border-slate-900 border-l-4 border-l-violet-500/50 p-6 space-y-4 animate-pulse">
                          <div className="flex justify-between items-center">
                            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                            <div className="h-4 bg-slate-800 rounded w-8"></div>
                          </div>
                          <div className="h-3 bg-slate-800 rounded w-full"></div>
                          <div className="h-24 bg-slate-900/80 rounded w-full"></div>
                        </div>
                        {/* Solution 2 Loader */}
                        <div className="bg-slate-900/40 rounded-lg border border-slate-900 border-l-4 border-l-teal-500/50 p-6 space-y-4 animate-pulse">
                          <div className="flex justify-between items-center">
                            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                            <div className="h-4 bg-slate-800 rounded w-8"></div>
                          </div>
                          <div className="h-3 bg-slate-800 rounded w-full"></div>
                          <div className="h-24 bg-slate-900/80 rounded w-full"></div>
                        </div>
                      </div>
                      {/* Judge Loader */}
                      <div className="bg-slate-900/40 border border-slate-900 border-l-4 border-l-blue-500/50 rounded-lg p-6 space-y-4 animate-pulse">
                        <div className="h-5 bg-slate-800 rounded w-1/4"></div>
                        <div className="h-4 bg-slate-800 rounded w-full"></div>
                        <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                      </div>
                    </div>
                  ) : (
                    /* Actual Responses */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Solution 1 Container */}
                        <div className="bg-slate-900/50 hover:bg-slate-900/70 rounded-lg border border-slate-900 border-l-4 border-l-violet-500/60 p-6 flex flex-col transition-all duration-300 shadow-sm relative group">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <Icons.Cpu className="text-violet-400 w-4 h-4" />
                              <span className="font-mono text-xs uppercase tracking-wider text-violet-400 bg-violet-950/40 border border-violet-900/40 px-2 py-0.5 rounded">
                                Solution 1 (Mistral)
                              </span>
                            </div>
                            {m.judge && (
                              <div className="text-sm font-semibold text-violet-300 bg-violet-950/20 border border-violet-900/30 px-2.5 py-0.5 rounded">
                                {m.judge.solution_1_score} / 10
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-slate-300">
                            <MarkdownRenderer content={m.solution_1} />
                          </div>
                        </div>

                        {/* Solution 2 Container */}
                        <div className="bg-slate-900/50 hover:bg-slate-900/70 rounded-lg border border-slate-900 border-l-4 border-l-teal-500/60 p-6 flex flex-col transition-all duration-300 shadow-sm relative group">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <Icons.Terminal className="text-teal-400 w-4 h-4" />
                              <span className="font-mono text-xs uppercase tracking-wider text-teal-400 bg-teal-950/40 border border-teal-900/40 px-2 py-0.5 rounded">
                                Solution 2 (Cohere)
                              </span>
                            </div>
                            {m.judge && (
                              <div className="text-sm font-semibold text-teal-300 bg-teal-950/20 border border-teal-900/30 px-2.5 py-0.5 rounded">
                                {m.judge.solution_2_score} / 10
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-slate-300">
                            <MarkdownRenderer content={m.solution_2} />
                          </div>
                        </div>
                      </div>

                      {/* Judge Recommendation Card */}
                      {m.judge && (
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/30 border border-slate-900 border-l-4 border-l-blue-500 rounded-lg p-6 sm:p-8 relative overflow-hidden shadow-md">
                          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-gradient-to-br from-blue-500 to-transparent"></div>
                          <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-800/85 pb-4">
                              <div className="flex items-center gap-2.5">
                                <Icons.Sparkles className="text-blue-400 w-5 h-5" />
                                <h3 className="text-base font-bold text-white uppercase tracking-wider">Gemini Judge Recommendation</h3>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Winner</span>
                                  <span className="text-xs font-semibold text-emerald-400 uppercase">
                                    {m.judge.solution_1_score > m.judge.solution_2_score ? 'Solution 1 (Mistral)' : m.judge.solution_1_score < m.judge.solution_2_score ? 'Solution 2 (Cohere)' : 'Draw'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Scores Evaluation Visual */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Score 1 */}
                              <div className="bg-slate-950/35 border border-slate-900/80 p-4 rounded-md space-y-2">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <span className="text-violet-400">Solution 1 (Mistral)</span>
                                  <span className="font-bold text-slate-200">{m.judge.solution_1_score} / 10</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-violet-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${m.judge.solution_1_score * 10}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-slate-400 pt-1 leading-relaxed text-left">
                                  {m.judge.solution_1_reasoning}
                                </p>
                              </div>

                              {/* Score 2 */}
                              <div className="bg-slate-950/35 border border-slate-900/80 p-4 rounded-md space-y-2">
                                <div className="flex justify-between items-center text-xs font-mono">
                                  <span className="text-teal-400">Solution 2 (Cohere)</span>
                                  <span className="font-bold text-slate-200">{m.judge.solution_2_score} / 10</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-teal-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${m.judge.solution_2_score * 10}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-slate-400 pt-1 leading-relaxed text-left">
                                  {m.judge.solution_2_reasoning}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Hidden reference to scroll down */}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Error panel */}
        {error && (
          <div className="mx-8 mb-4 p-4 border border-rose-950 bg-rose-950/20 text-rose-300 text-xs sm:text-sm rounded-md flex items-center justify-between shadow-md shrink-0">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-bold uppercase cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Form Panel */}
        <div className="shrink-0 border-t border-slate-900 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent p-6 pb-8">
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex items-end gap-2 focus-within:border-blue-500 transition-all duration-200 shadow-md">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={loading ? "AI Models are compiling code..." : "Enter your coding challenge or problem here..."}
                disabled={loading}
                className="flex-1 max-h-32 bg-transparent text-slate-200 text-sm sm:text-base border-none focus:outline-none resize-none px-3 py-2 w-full placeholder-slate-500 focus:ring-0"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-3 bg-white text-black hover:bg-slate-200 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-all shadow-sm shrink-0 flex items-center justify-center cursor-pointer active:scale-95 disabled:active:scale-100"
              >
                <Icons.Send />
              </button>
            </div>
            <div className="text-center mt-2.5">
              <span className="text-[10px] font-mono text-slate-600 tracking-wider">
                LangGraph is processing the prompt • Gemini will evaluate both solutions.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
