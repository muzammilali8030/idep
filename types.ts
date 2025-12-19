export enum ViewState {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  NEW_IDEA = 'NEW_IDEA',
  REPORT = 'REPORT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  token: string; // Simulating JWT
  avatar?: string;
}

export interface IdeaSubmission {
  title: string;
  description: string;
  industry: string;
  targetMarket: string;
  budget: string;
  location: string;
}

export interface FinancialYear {
  year: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface StartupScores {
  market: number;
  feasibility: number;
  financial: number;
  uniqueness: number;
  teamRequirement: number;
}

export interface AnalysisResult {
  executiveSummary: string;
  scores: StartupScores;
  financials: FinancialYear[];
  marketAnalysis: string;
  competitors: string[];
  legalSteps: { title: string; description: string }[];
  risks: { risk: string; mitigation: string; severity: 'Low' | 'Medium' | 'High' }[];
  investmentVerdict: string;
  recommendedStack: string[];
  hiringPlan: string[];
}

export interface Project {
  id: string;
  createdAt: number;
  submission: IdeaSubmission;
  analysis: AnalysisResult | null;
  status: 'processing' | 'completed' | 'failed';
}