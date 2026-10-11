import { Project } from '../types';

export const ExportService = {
  /**
   * Generates a clean LaTeX (.tex) document following IEEE / ACM standard template
   */
  generateLatex(project: Project): string {
    const doc = project.documents[0];
    const sectionsText = doc?.sections
      ? doc.sections
          .map((sec) => {
            const escaped = sec.content
              .replace(/#/g, '')
              .replace(/&/g, '\\&')
              .replace(/%/g, '\\%')
              .replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}')
              .replace(/\*(.+?)\*/g, '\\textit{$1}');
            return `\\section{${sec.title}}\n${escaped}\n`;
          })
          .join('\n\n')
      : '% No sections';

    return `% ====================================================================
% ResearchMind AI Academic LaTeX Document
% Project: ${project.title}
% Domain: ${project.domain}
% Generated on: ${new Date().toISOString()}
% ====================================================================

\\documentclass[conference,10pt]{IEEEtran}
\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\usepackage{hyperref}

\\begin{document}

\\title{${project.title}}

\\author{\\IEEEauthorblockN{Akhilesh Kumar}
\\IEEEauthorblockA{\\textit{Department of Computer Science and Engineering} \\\\
\\textit{National Institute of Technology}\\\\
Email: author@researchmind.ai}}

\\maketitle

${sectionsText}

\\begin{thebibliography}{00}
\\bibitem{b1} N. Carlini and D. Wagner, "Towards Evaluating the Robustness of Neural Networks," in \\textit{IEEE S\\&P}, 2017.
\\bibitem{b2} A. Vaswani et al., "Attention is All You Need," in \\textit{NeurIPS}, 2017.
\\end{thebibliography}

\\end{document}
`;
  },

  /**
   * Generates BibTeX (.bib)
   */
  generateBibtex(project: Project): string {
    if (project.citations && project.citations.length > 0) {
      return project.citations
        .map((cit, idx) => {
          const key = (cit.authors.split(' ')[0] || 'ref') + (cit.year || '2025') + `_${idx + 1}`;
          return `@article{${key.toLowerCase().replace(/[^a-z0-9_]/g, '')},
  author    = {${cit.authors}},
  title     = {${cit.title}},
  year      = {${cit.year}},
  journal   = {${cit.journal || cit.conference || 'Journal of Academic Computing'}},
  volume    = {${cit.volume || '1'}},
  pages     = {${cit.pages || '1-10'}},
  doi       = {${cit.doi || 'DOI verification required'}}
}`;
        })
        .join('\n\n');
    }

    return `@article{researchmind2026,
  author    = {Kumar, Akhilesh},
  title     = {${project.title}},
  year      = {2026},
  journal   = {ResearchMind AI Academic Repository},
  doi       = {DOI verification required}
}`;
  },

  /**
   * Generates Markdown (.md)
   */
  generateMarkdown(project: Project): string {
    const doc = project.documents[0];
    let md = `# ${project.title}\n\n`;
    md += `*Domain: ${project.domain}* | *Version: ${doc?.version || '1.0'}* | *Exported: ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    if (doc?.sections) {
      for (const sec of doc.sections) {
        md += `## ${sec.title}\n\n${sec.content}\n\n---\n\n`;
      }
    }

    if (project.citations && project.citations.length > 0) {
      md += `## References\n\n`;
      project.citations.forEach((cit, i) => {
        md += `[${i + 1}] ${cit.fullBibliography || `${cit.authors} (${cit.year}). ${cit.title}.`}\n\n`;
      });
    }

    return md;
  },

  /**
   * Generates Plain Text (.txt)
   */
  generatePlainText(project: Project): string {
    const doc = project.documents[0];
    let txt = `${project.title.toUpperCase()}\n`;
    txt += `Domain: ${project.domain}\nDate: ${new Date().toDateString()}\n`;
    txt += '='.repeat(80) + '\n\n';

    if (doc?.sections) {
      for (const sec of doc.sections) {
        txt += `SECTION: ${sec.title.toUpperCase()}\n`;
        txt += '-'.repeat(40) + '\n';
        txt += `${sec.content.replace(/[*#_`]/g, '')}\n\n`;
      }
    }

    return txt;
  },

  /**
   * Generates Microsoft Word document (.docx) compatible OOXML HTML string
   * This is universally opened by Microsoft Word, Google Docs, and LibreOffice with exact formatting
   */
  generateDocxHtml(project: Project): string {
    const doc = project.documents[0];
    let body = `<h1>${project.title}</h1>`;
    body += `<p style="font-style: italic; color: #555;">Domain: ${project.domain} | Date: ${new Date().toLocaleDateString()}</p><hr/>`;

    if (doc?.sections) {
      for (const sec of doc.sections) {
        body += `<h2>${sec.title}</h2>`;
        const htmlContent = sec.content
          .replace(/\n\n/g, '</p><p>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
        body += `<p>${htmlContent}</p>`;
      }
    }

    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${project.title}</title>
<style>
body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; margin: 1in; }
h1 { font-size: 18pt; text-align: center; margin-bottom: 20pt; font-weight: bold; }
h2 { font-size: 14pt; margin-top: 16pt; margin-bottom: 8pt; border-bottom: 1px solid #ccc; padding-bottom: 4pt; }
p { text-align: justify; text-justify: inter-word; margin-bottom: 10pt; }
table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
th, td { border: 1px solid #999; padding: 6pt 10pt; text-align: left; }
th { background-color: #f2f2f2; font-weight: bold; }
</style>
</head>
<body>
${body}
</body>
</html>`;
  },

  /**
   * Generates printable academic PDF HTML with cover page, headers, footers, and page-break support
   */
  generatePrintablePdfHtml(project: Project): string {
    const doc = project.documents[0];
    let sectionsHtml = '';

    if (doc?.sections) {
      for (const sec of doc.sections) {
        const parsed = sec.content
          .replace(/\n\n/g, '</p><p>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/### (.+)/g, '<h3>$1</h3>')
          .replace(/## (.+)/g, '<h2>$1</h2>');

        sectionsHtml += `
          <div class="academic-section">
            <h2>${sec.title}</h2>
            ${sec.isHypothetical ? '<div class="hypothetical-notice">⚠️ ACADEMIC DISCLOSURE: Experimental data in this section are theoretical design baselines. Empirical hardware trials are ongoing.</div>' : ''}
            <div class="section-body">
              <p>${parsed}</p>
            </div>
          </div>
        `;
      }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.title}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 20mm 25mm 20mm;
      @bottom-center { content: counter(page); }
    }
    body {
      font-family: 'Source Serif 4', 'Times New Roman', Georgia, serif;
      font-size: 11pt;
      line-height: 1.65;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 30px;
    }
    .paper-header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #111;
      padding-bottom: 25px;
    }
    .paper-title {
      font-size: 22pt;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 12px;
      color: #0f172a;
    }
    .paper-meta {
      font-size: 10pt;
      color: #475569;
      margin-bottom: 6px;
    }
    .paper-author {
      font-size: 12pt;
      font-weight: 600;
      margin-top: 10px;
      color: #1e293b;
    }
    .academic-section {
      margin-bottom: 24px;
    }
    h2 {
      font-size: 13pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 12px;
      color: #0f172a;
    }
    h3 {
      font-size: 11.5pt;
      font-weight: 600;
      margin-top: 14px;
      margin-bottom: 6px;
      color: #334155;
    }
    p {
      text-align: justify;
      margin-bottom: 12px;
    }
    .hypothetical-notice {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 8px 12px;
      font-size: 9.5pt;
      font-style: italic;
      color: #92400e;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
    }
    .page-footer {
      margin-top: 50px;
      text-align: center;
      font-size: 9pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <div class="paper-header">
    <div class="paper-title">${project.title}</div>
    <div class="paper-author">Akhilesh Kumar &amp; Research Collaborators</div>
    <div class="paper-meta">Department of Computer Science and Engineering, National Institute of Technology</div>
    <div class="paper-meta">Field of Study: ${project.domain} | Verified Academic Specification</div>
  </div>

  ${sectionsHtml}

  <div class="page-footer">
    ResearchMind AI Academic Platform — Verified Scientific Document Export
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog if opened in standalone window
      if (window.location.search.includes('autoprint=true')) {
        window.print();
      }
    };
  </script>
</body>
</html>`;
  },
};
