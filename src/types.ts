/**
 * ResearchMind AI — Core Types and Interfaces
 */

export type ProjectType = 'paper' | 'review' | 'book' | 'thesis' | 'report' | 'notes';

export type CitationStyle = 'APA 7' | 'IEEE' | 'MLA' | 'Chicago' | 'Harvard' | 'Vancouver';

export type DegreeLevel = 'PhD' | 'MTech' | 'MSc' | 'Undergrad';

export type ParaphraseMode =
  | 'Standard'
  | 'Academic'
  | 'Professional'
  | 'Simple'
  | 'Technical'
  | 'Concise'
  | 'Detailed'
  | 'Human-like'
  | 'Formal';

export type VerificationBadge = 'VERIFIED FACT' | 'USER PROVIDED' | 'AI GENERATED' | 'UNVERIFIED CLAIM';

export type CitationVerificationStatus = 'verified' | 'verification_required' | 'incomplete';

export interface CitationItem {
  id: string;
  authors: string;
  year: number | string;
  title: string;
  journal?: string;
  conference?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  citationStyle: CitationStyle;
  inTextCitation: string;
  fullBibliography: string;
  verificationStatus: CitationVerificationStatus;
  verificationNote?: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  authors: string;
  year: number | string;
  journal?: string;
  conference?: string;
  doi?: string;
  url?: string;
  abstract: string;
  keywords?: string[];
  method?: string;
  dataset?: string;
  results?: string;
  limitations?: string;
  researchGap?: string;
  sourceOrigin: 'verified_db' | 'user_upload' | 'search_result' | 'ai_suggested';
  relevanceScore?: number;
}

export interface PaperSection {
  id: string;
  title: string;
  content: string;
  wordCount?: number;
  status: 'draft' | 'generated' | 'reviewed' | 'completed';
  isHypothetical?: boolean;
}

export type ResearchGapCategory =
  | 'Methodological'
  | 'Dataset'
  | 'Geographic'
  | 'Population'
  | 'Temporal'
  | 'Technology'
  | 'Evaluation'
  | 'Theoretical'
  | 'Application';

export interface AiUsageStats {
  totalRequests: number;
  totalTokensEstimated: number;
  totalCostUsd: number;
  averageLatencyMs: number;
}

export interface AcademicDocument {
  id: string;
  projectId: string;
  title: string;
  type: ProjectType;
  sections: PaperSection[];
  rawText?: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface DocumentVersion {
  version: string;
  timestamp: string;
  summary: string;
  wordCount: number;
  snapshotContent: string;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  domain: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  documents: AcademicDocument[];
  sources: ResearchSource[];
  citations: CitationItem[];
  citationStyle?: CitationStyle;
  notes: string[];
  versions: DocumentVersion[];
  tags: string[];
}

export interface ResearchPaperParams {
  topic: string;
  domain: string;
  problem: string;
  objectives: string;
  methodology: string;
  targetJournal: string;
  wordCount: number;
  citationStyle: CitationStyle;
  referencesCount: number;
  yearRange: string;
  keywords: string;
}

export interface ReviewPaperParams {
  topic: string;
  domain: string;
  scope: string;
  themes: string;
  targetConference: string;
  citationStyle: CitationStyle;
}

export interface LiteratureMatrixRow {
  paper: string;
  year: string;
  method: string;
  dataset: string;
  results: string;
  limitations: string;
  researchGap: string;
}

export interface BookChapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  content: string;
  wordCount: number;
}

export interface BookParams {
  title: string;
  subject: string;
  targetAudience: string;
  chaptersCount: number;
  approximateWordCount: number;
  style: string;
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced' | 'Graduate/Research';
}

export interface ThesisParams {
  degreeLevel: DegreeLevel;
  title: string;
  institution: string;
  department: string;
  candidateName: string;
  advisorName: string;
  submissionDate: string;
  domain: string;
  abstractSummary: string;
}

export interface ResearchGapItem {
  id: string;
  category:
    | 'Methodological'
    | 'Dataset'
    | 'Geographic'
    | 'Population'
    | 'Temporal'
    | 'Technology'
    | 'Evaluation'
    | 'Theoretical'
    | 'Application';
  existingResearch: string;
  limitations: string;
  unresolvedProblem: string;
  researchGap: string;
  proposedQuestion: string;
  proposedMethod: string;
  expectedContribution: string;
}

export interface NovelContributionProposal {
  type: string;
  title: string;
  description: string;
  potentialImpact: string;
  verificationDisclaimer: string; // "Potentially novel contribution — requires literature verification."
  targetBenchmarks: string[];
}

export interface ParaphraseRequest {
  text: string;
  mode: ParaphraseMode;
  preserveQuotesAndCitations: boolean;
}

export interface ParaphraseResponse {
  original: string;
  paraphrased: string;
  mode: ParaphraseMode;
  wordsChanged: number;
  readingEaseScore: string;
  academicEnhancements: string[];
  preservedEntities: string[];
}

export interface PlagiarismCheckRequest {
  text: string;
  mode: 'internal' | 'web' | 'hybrid';
}

export interface SimilarityMatch {
  passage: string;
  matchedSource: string;
  similarityPercentage: number;
  confidence: 'High' | 'Medium' | 'Low';
  sourceUrl?: string;
  matchType: 'Exact Match' | 'Paraphrased Match' | 'Structural Similarity';
}

export interface PlagiarismReport {
  overallSimilarity: number;
  isAcceptableThreshold: boolean;
  checkedWordsCount: number;
  matchedSourcesCount: number;
  mode: 'internal' | 'web' | 'hybrid';
  matches: SimilarityMatch[];
  disclaimer: string;
  generatedAt: string;
}

export interface DocumentQualityReport {
  overallScore: number; // 0-100
  academicQuality: {
    grammarScore: number;
    clarityScore: number;
    toneConsistency: string;
    suggestions: string[];
  };
  researchQuality: {
    problemClarity: string;
    gapWellDefined: boolean;
    methodologySoundness: string;
    findingsValidation: string;
    suggestions: string[];
  };
  formattingQuality: {
    headingHierarchy: boolean;
    figureTableCaptions: boolean;
    citationConsistency: boolean;
    suggestions: string[];
  };
}

export interface DatasetSummary {
  fileName: string;
  rowsCount: number;
  columnsCount: number;
  columns: {
    name: string;
    dataType: 'numeric' | 'categorical' | 'datetime' | 'text';
    missingCount: number;
    missingPct: number;
    uniqueValues: number;
    sampleValues: string[];
  }[];
  duplicatesCount: number;
  missingCellsTotal: number;
  statisticalSummary: string;
  preprocessingRecommendations: string[];
  recommendedAlgorithms: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  institution: string;
  role: 'Researcher' | 'Professor' | 'PhD Scholar' | 'MTech Student' | 'Author';
  tokenUsage: number;
}

export type AiModelId = 'gemini';

export interface AiModelConfig {
  id: AiModelId;
  name: string;
  provider: string;
  version: string;
  badge: string;
  avatarColor: string;
  accentColor: string;
  tagline: string;
  strengths: string[];
  signatureFeature: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  model?: string;
  text: string;
  thoughtProcess?: string;
  thinkingTimeSeconds?: number;
  sources?: Array<{ title: string; url?: string; snippet?: string }>;
  suggestedPrompts?: string[];
  createdAt: string;
}

export interface GeneratedPaperSection {
  id: string;
  title: string;
  content: string;
  keyFindings?: string[];
  wordCount?: number;
}

export interface GeneratedPaperReference {
  id: string;
  index: number;
  citation: string;
  doi?: string;
  year?: string;
  authors?: string;
}

export interface GeneratedPaper {
  id: string;
  query: string;
  title: string;
  subtitle?: string;
  authors: string;
  affiliation: string;
  abstract: string;
  keywords: string[];
  citationStyle: CitationStyle;
  modelUsed: string;
  createdAt: string;
  sections: GeneratedPaperSection[];
  references: GeneratedPaperReference[];
  metrics: {
    wordCount: number;
    readingTimeMinutes: number;
    citationsCount: number;
    equationsCount: number;
    tablesCount: number;
  };
  fullMarkdown: string;
}

export interface PaperSearchOptions {
  query: string;
  model?: string;
  citationStyle?: CitationStyle;
  domain?: string;
  targetLength?: 'compact' | 'standard' | 'extended';
  includeLatex?: boolean;
  includeTables?: boolean;
}

export interface PaperSearchResponse {
  paper: GeneratedPaper;
  thoughtProcess?: string;
  thinkingTimeSeconds?: number;
  suggestedFollowUps?: string[];
}

export type AcademicTone =
  | 'Formal Academic'
  | 'Empirical & Objective'
  | 'Persuasive & Defensible'
  | 'High-Impact & Direct'
  | 'Critical & Evaluative'
  | 'Plain & Accessible';

export interface TransformSelectionRequest {
  text: string;
  action: 'paraphrase' | 'change-tone';
  mode?: ParaphraseMode;
  tone?: AcademicTone;
  surroundingContext?: string;
}

export interface TransformSelectionResponse {
  original: string;
  transformed: string;
  alternative?: string;
  action: 'paraphrase' | 'change-tone';
  selectedOption: string;
  wordsOriginal: number;
  wordsTransformed: number;
  explanation?: string;
  keyChanges?: string[];
}

