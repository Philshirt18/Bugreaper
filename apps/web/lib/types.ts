// Core types for multi-format auto-fix system

export type Language = 
  | 'typescript' 
  | 'javascript' 
  | 'python' 
  | 'html' 
  | 'css' 
  | 'json' 
  | 'yaml' 
  | 'markdown' 
  | 'sql'
  | 'unknown';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type IssueStatus = 'pending' | 'analyzing' | 'fixing' | 'fixed' | 'failed' | 'skipped';

export interface Issue {
  id: string;
  file: string;
  language: Language;
  line: number;
  endLine?: number;
  column?: number;
  severity: IssueSeverity;
  rule: string;
  message: string;
  suggestedFix?: string;
  status: IssueStatus;
  createdAt: Date;
  fixedAt?: Date;
}

export interface FixSpec {
  issueId: string;
  file: string;
  language: Language;
  lineRange: [number, number];
  rule: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  safetyChecks: {
    preservesAPI: boolean;
    noDataLoss: boolean;
    testsPass: boolean;
    lintPass: boolean;
  };
}

export interface FixResult {
  issueId: string;
  success: boolean;
  appliedDiff?: string;
  error?: string;
  checksRun: string[];
  checksPassed: boolean;
  rollbackAvailable: boolean;
}

export interface ScanResult {
  totalIssues: number;
  byLanguage: Record<Language, number>;
  bySeverity: Record<IssueSeverity, number>;
  issues: Issue[];
  scannedFiles: number;
  duration: number;
}
