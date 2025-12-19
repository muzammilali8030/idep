import React, { useState, useEffect } from 'react';
import { ViewState, Project, IdeaSubmission, User } from './types';
import { analyzeIdea } from './services/geminiService';
import { authService } from './services/authService';
import { 
  BarChart3, 
  Lightbulb, 
  Settings, 
  Plus, 
  Printer, 
  ArrowLeft, 
  Briefcase, 
  Users, 
  Globe, 
  Scale, 
  DollarSign, 
  AlertTriangle, 
  LogOut,
  User as UserIcon
} from './components/Icons';
import { FinancialChart, ScoreChart } from './components/ReportCharts';
import { Auth } from './components/Auth';
import { Footer } from './components/Footer';

function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // New Idea Form State
  const [formData, setFormData] = useState<IdeaSubmission>({
    title: '',
    industry: 'SaaS',
    description: '',
    targetMarket: '',
    budget: 'Bootstrapped (< $5k)',
    location: 'Pakistan'
  });

  // --- Navigation & History Handling ---
  
  useEffect(() => {
    // Initialize history state if needed
    if (!window.history.state) {
      window.history.replaceState({ view: ViewState.LANDING }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        // Fallback for empty state (e.g. manual URL entry)
        setView(ViewState.LANDING);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView: ViewState, replace = false) => {
    setView(newView);
    if (replace) {
      window.history.replaceState({ view: newView }, '');
    } else {
      window.history.pushState({ view: newView }, '');
    }
    // Scroll to top on navigation
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    // Check if we can actually go back in history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback navigation if opened directly
      if (view === ViewState.NEW_IDEA || view === ViewState.REPORT) {
        navigateTo(ViewState.DASHBOARD, true);
      } else {
        navigateTo(ViewState.LANDING, true);
      }
    }
  };

  // --- Auth & Data Loading ---

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoadingAuth(false);
    
    // If user is already logged in and we are on Landing, move to Dashboard
    if (currentUser && view === ViewState.LANDING) {
      // We don't auto-navigate here to avoid loop/conflict with history init, 
      // but user can click "Dashboard" button.
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('founder_validator_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('founder_validator_projects', JSON.stringify(projects));
  }, [projects]);

  // --- Handlers ---

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    navigateTo(ViewState.DASHBOARD, true); // Replace history so back button doesn't go to login
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigateTo(ViewState.LANDING, true);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigateTo(ViewState.AUTH);
      return;
    }

    setIsAnalyzing(true);

    const newProject: Project = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      submission: { ...formData },
      analysis: null,
      status: 'processing'
    };

    // Optimistic update
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);

    try {
      const analysis = await analyzeIdea(formData);
      
      setProjects(prev => prev.map(p => 
        p.id === newProject.id 
          ? { ...p, analysis, status: 'completed' } 
          : p
      ));
      
      navigateTo(ViewState.REPORT);
    } catch (error) {
      setProjects(prev => prev.map(p => 
        p.id === newProject.id 
          ? { ...p, status: 'failed' } 
          : p
      ));
      alert("Analysis failed. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  // --- Views ---

  const renderLanding = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-2 rounded-lg">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Idea Validator</span>
        </div>
        <div className="flex items-center gap-4">
           {user ? (
             <button 
               onClick={() => navigateTo(ViewState.DASHBOARD)}
               className="text-slate-600 hover:text-brand-600 font-medium transition-colors"
             >
               Dashboard
             </button>
           ) : (
             <button 
               onClick={() => navigateTo(ViewState.AUTH)}
               className="text-slate-600 hover:text-brand-600 font-medium transition-colors"
             >
               Login
             </button>
           )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 font-semibold text-sm mb-6 border border-brand-100">
          AI-Powered Startup Consultant
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight max-w-4xl leading-tight">
          Validate your startup idea <br/>
          <span className="text-brand-600">before you build.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl">
          Get an investor-ready analysis including market feasibility, financial projections, and legal roadmaps in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => user ? navigateTo(ViewState.NEW_IDEA) : navigateTo(ViewState.AUTH)}
            className="px-8 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            Validate My Idea Free
          </button>
          <button 
            onClick={() => user ? navigateTo(ViewState.DASHBOARD) : navigateTo(ViewState.AUTH)}
            className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            View Sample Reports
          </button>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
              <BarChart3 />
            </div>
            <h3 className="font-bold text-lg mb-2">Financial Models</h3>
            <p className="text-slate-500">Instant 3-year revenue and profit projections based on industry benchmarks.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600">
              <Scale />
            </div>
            <h3 className="font-bold text-lg mb-2">Legal Roadmap</h3>
            <p className="text-slate-500">Country-specific registration steps (e.g., SECP, FBR) to get you compliant.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 text-amber-600">
              <Lightbulb />
            </div>
            <h3 className="font-bold text-lg mb-2">Risk Analysis</h3>
            <p className="text-slate-500">Identify potential pitfalls and competitor threats before you spend a dime.</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );

  const renderDashboard = () => (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo(ViewState.LANDING)}>
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">Idea Validator</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-brand-50 text-brand-700 rounded-lg font-medium">
            <Briefcase className="w-5 h-5" />
            My Projects
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
               {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <UserIcon className="w-6 h-6"/>}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">My Reports</h2>
          <button 
            onClick={() => navigateTo(ViewState.NEW_IDEA)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            New Analysis
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
              <Lightbulb className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No ideas validated yet</h3>
            <p className="text-slate-500 mb-6">Submit your first startup idea to get an investor-ready report.</p>
            <button 
              onClick={() => navigateTo(ViewState.NEW_IDEA)}
              className="text-brand-600 font-medium hover:underline"
            >
              Start Analysis &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div 
                key={project.id}
                onClick={() => {
                  setActiveProjectId(project.id);
                  navigateTo(ViewState.REPORT);
                }}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wide">
                    {project.submission.industry}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-1">
                  {project.submission.title}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                  {project.submission.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {project.submission.location}
                  </div>
                  {project.analysis && (
                    <div className="flex items-center gap-1 font-semibold text-brand-600 ml-auto">
                      Score: {(Object.values(project.analysis.scores) as number[]).reduce((a, b) => a+b, 0) / 5}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  const renderNewIdea = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {isAnalyzing ? (
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md w-full">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
            <Lightbulb className="absolute inset-0 m-auto text-brand-500 w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your Idea...</h2>
          <p className="text-slate-500">Our AI is researching market trends, calculating financials, and checking legal requirements for {formData.location}.</p>
          <div className="mt-6 space-y-2 text-sm text-slate-400">
            <p>Crunching competitor data...</p>
            <p>Estimating burn rate...</p>
            <p>Generating legal checklist...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl w-full">
          <button 
            onClick={goBack} 
            className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h1 className="text-2xl font-bold text-slate-900">New Idea Validation</h1>
              <p className="text-slate-500 mt-1">Fill in the details below to generate a comprehensive report.</p>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="e.g. AgriTech Drone Service"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Location</label>
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  >
                    <option>Pakistan</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>India</option>
                    <option>Global / Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Industry / Sector</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="e.g. FinTech, E-commerce, Healthcare"
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Idea Description (Be detailed)</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  placeholder="Describe the problem, your solution, and how it works..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Target Market</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="e.g. Small business owners in Karachi"
                    value={formData.targetMarket}
                    onChange={e => setFormData({...formData, targetMarket: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Budget</label>
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                  >
                    <option>Bootstrapped (&lt; $1k)</option>
                    <option>Seed ($5k - $20k)</option>
                    <option>Funded ($50k+)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Lightbulb className="w-5 h-5" />
                  Generate Investor Report
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Powered by Gemini AI. Takes approx 10-20 seconds.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderReport = () => {
    if (!activeProject || !activeProject.analysis) return null;
    const { analysis, submission } = activeProject;

    return (
      <div className="min-h-screen bg-slate-100 print:bg-white">
        {/* Navigation Bar - Hidden on Print */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={goBack}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900">{submission.title}</h1>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Validation Report</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-8 print:p-0 print:max-w-none">
          
          {/* Executive Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6 print:shadow-none print:border-none print:mb-8 page-break">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{submission.title}</h2>
                <div className="flex gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {submission.industry}</span>
                  <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {submission.location}</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                analysis.investmentVerdict.includes('Invest') ? 'bg-green-100 text-green-700' : 
                analysis.investmentVerdict.includes('Pivot') ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                {analysis.investmentVerdict}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Executive Summary</h3>
              <p className="text-slate-700 leading-relaxed text-lg">{analysis.executiveSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-slate-100 pt-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Startup Scorecard</h3>
                <ScoreChart scores={analysis.scores} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recommended Stack</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {analysis.recommendedStack.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                      {tech}
                    </span>
                  ))}
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Key Hires Needed</h3>
                <ul className="space-y-2">
                  {analysis.hiringPlan.map((hire, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <Users className="w-4 h-4 text-brand-500" />
                      {hire}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Market & Financials */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:block">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:mb-8 page-break">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="text-brand-600" /> Market Analysis
              </h3>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed whitespace-pre-line">
                {analysis.marketAnalysis}
              </p>
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 text-sm">Top Competitors</h4>
                <div className="space-y-2">
                  {analysis.competitors.map((comp, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-700">{comp}</span>
                      <span className="text-xs text-slate-400">Competitor</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:mb-8 page-break">
               <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="text-green-600" /> Financial Projections (3 Years)
              </h3>
              <div className="mb-6">
                <FinancialChart data={analysis.financials} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-2 rounded-l-lg">Year</th>
                      <th className="px-4 py-2">Revenue</th>
                      <th className="px-4 py-2">Cost</th>
                      <th className="px-4 py-2 rounded-r-lg">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.financials.map((f, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{f.year}</td>
                        <td className="px-4 py-3 text-slate-600">${f.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-600">${f.cost.toLocaleString()}</td>
                        <td className={`px-4 py-3 font-bold ${f.profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          ${f.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Legal & Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:mb-8 page-break">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Scale className="text-slate-600" /> Legal Roadmap ({submission.location})
              </h3>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                {analysis.legalSteps.map((step, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-brand-500"></div>
                    <h4 className="font-bold text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-slate-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none page-break">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" /> Risk Assessment
              </h3>
              <div className="space-y-4">
                {analysis.risks.map((risk, i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-slate-900">{risk.risk}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        risk.severity === 'High' ? 'bg-red-100 text-red-700' :
                        risk.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {risk.severity} Risk
                      </span>
                    </div>
                    <p className="text-sm text-slate-600"><span className="font-medium text-slate-700">Mitigation:</span> {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-slate-400 text-xs print:mt-16">
             Generated by Idea Validator AI. Not financial advice.
          </div>
        </div>
      </div>
    );
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {view === ViewState.LANDING && renderLanding()}
      {view === ViewState.AUTH && (
        <Auth 
          onAuthSuccess={handleAuthSuccess} 
          onCancel={() => navigateTo(ViewState.LANDING)}
        />
      )}
      {view === ViewState.DASHBOARD && renderDashboard()}
      {view === ViewState.NEW_IDEA && renderNewIdea()}
      {view === ViewState.REPORT && renderReport()}
    </>
  );
}

export default App;