import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { DataStore } from './src/server/dataStore';
import { GeminiService } from './src/server/geminiService';
import { ExportService } from './src/server/exportService';
import { WebResearchService } from './src/server/webResearchService';
import { Project, AcademicDocument, PaperSection, CitationItem } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ResearchMind AI Backend',
    version: '2.4.0',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = DataStore.getUser();
  res.json({
    token: 'jwt-auth-session-rm-2026',
    user: {
      ...user,
      email: email || user.email,
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, institution, role } = req.body;
  const user = DataStore.updateUser({
    name: name || 'Academic Scholar',
    email: email || 'scholar@university.edu',
    institution: institution || 'Academic Institute',
    role: role || 'Researcher',
  });
  res.json({
    token: 'jwt-auth-session-rm-2026',
    user,
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: DataStore.getUser() });
});

// Project Routes
app.get('/api/projects', (req, res) => {
  res.json({ projects: DataStore.getProjects() });
});

app.get('/api/projects/:id', (req, res) => {
  const project = DataStore.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  res.json({ project });
});

app.post('/api/projects', (req, res) => {
  const { title, type, domain, description, tags } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Project title is required.' });
  }

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    title,
    type: type || 'paper',
    domain: domain || 'General Academic Research',
    description: description || 'New academic project initialized in ResearchMind AI.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: tags || ['Research'],
    documents: [
      {
        id: `doc-${Date.now()}`,
        projectId: `proj-${Date.now()}`,
        title,
        type: type || 'paper',
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sections: [
          {
            id: `sec-init-${Date.now()}`,
            title: '1. Introduction & Overview',
            content: `### 1. Introduction\nInitiate your research writing on ${title} within ${domain || 'the academic field'}.`,
            status: 'draft',
          },
        ],
      },
    ],
    sources: [],
    citations: [],
    notes: [],
    versions: [],
  };

  const created = DataStore.createProject(newProject);
  res.status(201).json({ project: created });
});

app.put('/api/projects/:id', (req, res) => {
  const updated = DataStore.updateProject(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  res.json({ project: updated });
});

app.delete('/api/projects/:id', (req, res) => {
  const success = DataStore.deleteProject(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  res.json({ success: true, message: 'Project removed successfully.' });
});

// Update or add section to document
app.post('/api/projects/:id/sections', (req, res) => {
  const project = DataStore.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const { sectionId, title, content, isHypothetical } = req.body;
  const doc = project.documents[0];

  if (!doc) {
    return res.status(400).json({ error: 'No active document in project.' });
  }

  const existingIdx = doc.sections.findIndex((s) => s.id === sectionId);
  if (existingIdx !== -1) {
    doc.sections[existingIdx] = {
      ...doc.sections[existingIdx],
      title: title ?? doc.sections[existingIdx].title,
      content: content ?? doc.sections[existingIdx].content,
      isHypothetical: isHypothetical ?? doc.sections[existingIdx].isHypothetical,
      status: 'reviewed',
    };
  } else {
    doc.sections.push({
      id: sectionId || `sec-${Date.now()}`,
      title: title || 'New Section',
      content: content || '',
      status: 'draft',
      isHypothetical: !!isHypothetical,
    });
  }

  DataStore.updateProject(project.id, { documents: project.documents });
  res.json({ project });
});

// AI Search to Full Research Paper Generator (ChatGPT-Style Interface)
app.post('/api/research/search-paper', async (req, res) => {
  try {
    const { query, model, citationStyle, domain, targetLength, includeLatex, includeTables } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query or research topic is required.' });
    }

    const result = await GeminiService.generateFullPaperFromSearch({
      query: query.trim(),
      citationStyle: citationStyle || 'IEEE',
      domain: domain || 'Computer Science & AI',
      targetLength: targetLength || 'standard',
      includeLatex: includeLatex !== false,
      includeTables: includeTables !== false,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Search paper generation error:', err);
    res.status(500).json({ error: 'Failed to generate full research paper from query.' });
  }
});

// AI Research Paper Wizard
app.post('/api/research/paper-wizard', async (req, res) => {
  try {
    const params = req.body;
    if (!params.topic) {
      return res.status(400).json({ error: 'Research topic is required.' });
    }

    const sections = await GeminiService.generateResearchPaper(params);

    // If projectId provided, save directly to project
    if (params.projectId) {
      const project = DataStore.getProjectById(params.projectId);
      if (project && project.documents[0]) {
        project.documents[0].sections = sections;
        project.documents[0].updatedAt = new Date().toISOString();
        DataStore.updateProject(project.id, { documents: project.documents });
      }
    }

    res.json({ sections });
  } catch (err: any) {
    console.error('Paper Wizard error:', err);
    res.status(500).json({ error: 'Failed to generate research paper structure.' });
  }
});

// AI Review Paper Generator
app.post('/api/research/review-paper', async (req, res) => {
  try {
    const params = req.body;
    if (!params.topic) {
      return res.status(400).json({ error: 'Review topic is required.' });
    }
    const result = await GeminiService.generateReviewPaper(params);
    res.json(result);
  } catch (err: any) {
    console.error('Review Paper error:', err);
    res.status(500).json({ error: 'Failed to generate review paper.' });
  }
});

// AI Book Writer
app.post('/api/research/book-outline', async (req, res) => {
  try {
    const params = req.body;
    const result = await GeminiService.generateBookOutline(params);
    res.json(result);
  } catch (err: any) {
    console.error('Book outline error:', err);
    res.status(500).json({ error: 'Failed to generate book outline.' });
  }
});

// AI Thesis Generator
app.post('/api/research/thesis', async (req, res) => {
  try {
    const params = req.body;
    const result = await GeminiService.generateThesis(params);
    res.json(result);
  } catch (err: any) {
    console.error('Thesis generator error:', err);
    res.status(500).json({ error: 'Failed to generate thesis structure.' });
  }
});

// AI Research Gap Engine
app.post('/api/research/gap-finder', async (req, res) => {
  try {
    const { topic, domain, context } = req.body;
    const gaps = await GeminiService.identifyResearchGaps(topic || 'Machine Learning', domain || 'Computer Science', context);
    res.json({ gaps });
  } catch (err: any) {
    console.error('Gap finder error:', err);
    res.status(500).json({ error: 'Failed to analyze research gaps.' });
  }
});

// Unique Contribution Generator
app.post('/api/research/contributions', async (req, res) => {
  try {
    const { topic, domain } = req.body;
    const contributions = await GeminiService.generateNovelContributions(topic || 'Deep Learning', domain || 'Computer Science');
    res.json({ contributions });
  } catch (err: any) {
    console.error('Contributions error:', err);
    res.status(500).json({ error: 'Failed to propose novel contributions.' });
  }
});

// AI Paraphraser
app.post('/api/paraphrase', async (req, res) => {
  try {
    const { text, mode, preserveQuotesAndCitations } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Input text is required.' });
    }
    const result = await GeminiService.paraphrase(text, mode || 'Academic', preserveQuotesAndCitations !== false);
    res.json(result);
  } catch (err: any) {
    console.error('Paraphrase error:', err);
    res.status(500).json({ error: 'Paraphrasing operation failed.' });
  }
});

// AI Direct Selection Paraphraser & Tone Shift
app.post('/api/paper/transform-selection', async (req, res) => {
  try {
    const { text, action, mode, tone, surroundingContext } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Selection text is required.' });
    }
    const result = await GeminiService.transformSelectedText({
      text: text.trim(),
      action: action || 'paraphrase',
      mode: mode || 'Academic',
      tone: tone || 'Formal Academic',
      surroundingContext,
    });
    res.json(result);
  } catch (err: any) {
    console.error('Transform selection error:', err);
    res.status(500).json({ error: 'Failed to transform selected text.' });
  }
});

// Plagiarism & Similarity Checker
app.post('/api/plagiarism/check', async (req, res) => {
  try {
    const { text, mode } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Document text is required for similarity checking.' });
    }
    const report = await GeminiService.checkPlagiarism(text, mode || 'hybrid');
    res.json(report);
  } catch (err: any) {
    console.error('Plagiarism check error:', err);
    res.status(500).json({ error: 'Similarity analysis failed.' });
  }
});

// Citation Generator & Manager
app.post('/api/citations/generate', (req, res) => {
  try {
    const { authors, year, title, journal, conference, volume, issue, pages, doi, url, citationStyle } = req.body;
    const formatted = WebResearchService.formatCitation(
      { authors, year, title, journal, conference, volume, issue, pages, doi, url },
      citationStyle || 'APA 7'
    );
    const doiVerification = WebResearchService.verifyDoi(doi);

    const citation: CitationItem = {
      id: `cit-${Date.now()}`,
      authors,
      year,
      title,
      journal,
      conference,
      volume,
      issue,
      pages,
      doi,
      url,
      citationStyle: citationStyle || 'APA 7',
      inTextCitation: formatted.inText,
      fullBibliography: formatted.bibliography,
      verificationStatus: doiVerification.status,
      verificationNote: doiVerification.note,
    };

    res.json({ citation });
  } catch (err: any) {
    console.error('Citation generate error:', err);
    res.status(500).json({ error: 'Failed to generate citation.' });
  }
});

app.post('/api/citations/verify', (req, res) => {
  const { doi } = req.body;
  const result = WebResearchService.verifyDoi(doi);
  res.json(result);
});

// Web Research Search
app.post('/api/web-research', async (req, res) => {
  try {
    const { query, domain } = req.body;
    const sources = await WebResearchService.searchScholarlySources(query || '', domain);
    res.json({ sources });
  } catch (err: any) {
    console.error('Web research error:', err);
    res.status(500).json({ error: 'Academic search failed.' });
  }
});

// PDF & Document Analyzer
app.post('/api/documents/analyze-pdf', async (req, res) => {
  try {
    const { title, text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Document text or PDF extract is required.' });
    }
    const analysis = await GeminiService.analyzePaper(title || 'Uploaded Academic Document', text);
    res.json(analysis);
  } catch (err: any) {
    console.error('PDF analysis error:', err);
    res.status(500).json({ error: 'Document parsing failed.' });
  }
});

// Dataset Analyzer
app.post('/api/datasets/analyze', (req, res) => {
  try {
    const { csvText, fileName } = req.body;
    if (!csvText) {
      return res.status(400).json({ error: 'CSV data is required.' });
    }
    const summary = GeminiService.analyzeDataset(csvText, fileName || 'dataset.csv');
    res.json(summary);
  } catch (err: any) {
    console.error('Dataset analysis error:', err);
    res.status(400).json({ error: err?.message || 'Invalid dataset format.' });
  }
});

// Figure & Table Generator
app.post('/api/figures-tables/generate', async (req, res) => {
  try {
    const { type, topic, description } = req.body;
    const result = await GeminiService.generateFigureTable(type || 'Flowchart', topic || 'System Architecture', description || '');
    res.json(result);
  } catch (err: any) {
    console.error('Figure generation error:', err);
    res.status(500).json({ error: 'Failed to generate figure/table.' });
  }
});

// Document Quality Check
app.post('/api/documents/quality-check', async (req, res) => {
  try {
    const { content } = req.body;
    const report = await GeminiService.qualityCheck(content || '');
    res.json(report);
  } catch (err: any) {
    console.error('Quality check error:', err);
    res.status(500).json({ error: 'Failed to check document quality.' });
  }
});

// Research Chatbot (Supports ChatGPT, Grok, DeepSeek, Qwen)
const handleChatRequest = async (req: express.Request, res: express.Response) => {
  try {
    const { message, projectContext, history, model, mode, webSearch } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const selectedModel = (model || 'deepseek') as 'chatgpt' | 'grok' | 'deepseek' | 'qwen';
    const result = await GeminiService.generateModelChat({
      model: selectedModel,
      message,
      projectContext,
      mode,
      webSearch: !!webSearch,
      history,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat assistant error.' });
  }
};

app.post('/api/chat', handleChatRequest);
app.post('/api/ai/chat', handleChatRequest);

// Multi-Model Arena Endpoint (Queries ChatGPT, Grok, DeepSeek, and Qwen side-by-side)
app.post('/api/ai/arena', async (req, res) => {
  try {
    const { prompt, projectContext } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required for model arena.' });
    }

    const results = await GeminiService.generateMultiModelArena(prompt, projectContext);
    res.json({ results });
  } catch (err: any) {
    console.error('Arena error:', err);
    res.status(500).json({ error: 'Failed to execute multi-model arena.' });
  }
});


// Export Routes
app.get('/api/export/:projectId/:format', (req, res) => {
  const { projectId, format } = req.params;
  const project = DataStore.getProjectById(projectId);
  if (!project) {
    return res.status(404).send('Project not found');
  }

  const safeTitle = project.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);

  switch (format) {
    case 'docx': {
      const docxHtml = ExportService.generateDocxHtml(project);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.docx"`);
      return res.send(docxHtml);
    }
    case 'pdf': {
      const pdfHtml = ExportService.generatePrintablePdfHtml(project);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(pdfHtml);
    }
    case 'latex':
    case 'tex': {
      const tex = ExportService.generateLatex(project);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.tex"`);
      return res.send(tex);
    }
    case 'bib':
    case 'bibtex': {
      const bib = ExportService.generateBibtex(project);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.bib"`);
      return res.send(bib);
    }
    case 'md': {
      const md = ExportService.generateMarkdown(project);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.md"`);
      return res.send(md);
    }
    case 'txt': {
      const txt = ExportService.generatePlainText(project);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.txt"`);
      return res.send(txt);
    }
    default:
      return res.status(400).send('Unsupported export format.');
  }
});

// Direct Generated Paper Export Route (from AcademicPaperStudio)
app.post('/api/paper/export/:format', (req, res) => {
  const { format } = req.params;
  const { paper } = req.body;
  if (!paper || !paper.title) {
    return res.status(400).json({ error: 'Paper object is required.' });
  }

  // Construct temporary project representation
  const allSections = [
    {
      id: 'sec-abstract',
      title: 'Abstract',
      content: paper.abstract,
      wordCount: paper.abstract?.split(/\s+/).filter(Boolean).length || 150,
    },
    ...(paper.sections || []).map((s: any, idx: number) => ({
      id: s.id || `s-${idx}`,
      title: s.title,
      content: s.content,
      wordCount: s.wordCount || s.content?.split(/\s+/).filter(Boolean).length || 100,
    })),
  ];

  const tempProject: Project = {
    id: `temp-${Date.now()}`,
    title: paper.title,
    type: 'paper',
    domain: paper.query || 'Academic Research',
    description: paper.subtitle || paper.title,
    createdAt: paper.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    citationStyle: paper.citationStyle || 'IEEE',
    documents: [
      {
        id: 'doc-1',
        projectId: `temp-${Date.now()}`,
        title: paper.title,
        type: 'paper',
        sections: allSections,
        createdAt: paper.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
      },
    ],
    sources: [],
    citations: (paper.references || []).map((r: any, idx: number) => ({
      id: `c-${idx}`,
      authors: r.citation.split('.')[0] || 'Scholarly Authors',
      year: 2024,
      title: r.citation,
      citationStyle: paper.citationStyle || 'IEEE',
      fullBibliography: r.citation,
      doi: r.doi,
      verificationStatus: 'verified',
    })),
    notes: [],
    versions: [],
    tags: paper.keywords || [],
  };

  const safeTitle = paper.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);

  switch (format) {
    case 'docx': {
      const docxHtml = ExportService.generateDocxHtml(tempProject);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.docx"`);
      return res.send(docxHtml);
    }
    case 'pdf': {
      const pdfHtml = ExportService.generatePrintablePdfHtml(tempProject);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(pdfHtml);
    }
    case 'txt': {
      const txt = ExportService.generatePlainText(tempProject);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.txt"`);
      return res.send(txt);
    }
    default:
      return res.status(400).send('Unsupported export format.');
  }
});

// Admin Stats
app.get('/api/admin/stats', (req, res) => {
  res.json({
    aiStats: DataStore.getAiStats(),
    errorLogs: DataStore.getErrorLogs(),
    system: {
      uptimeSeconds: process.uptime(),
      memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      nodeVersion: process.version,
      platform: process.platform,
    },
  });
});

// Start Server & Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResearchMind AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ResearchMind AI server:', err);
});
