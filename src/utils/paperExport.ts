import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';
import { GeneratedPaper, Project } from '../types';

/**
 * Clean up text for filenames
 */
export function getSafeFilename(title: string, ext: string): string {
  const clean = title
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 45) || 'Research_Paper';
  return `${clean}.${ext}`;
}

/**
 * Trigger browser file download from Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Format markdown text into plain text strings
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .trim();
}

/**
 * =========================================================================
 * 1. DIRECT MICROSOFT WORD (.DOCX) GENERATOR
 * =========================================================================
 */
export async function exportPaperToDocx(paper: GeneratedPaper): Promise<void> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: paper.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 180, before: 120 },
    })
  );

  // Subtitle (if available)
  if (paper.subtitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: paper.subtitle,
            italics: true,
            size: 24, // 12pt
            color: '555555',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
      })
    );
  }

  // Authors & Affiliation
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: paper.authors,
          bold: true,
          size: 22,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: paper.affiliation,
          italics: true,
          size: 20,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Abstract Heading
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'ABSTRACT',
          bold: true,
          size: 22,
          color: '1E3A8A',
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: cleanMarkdown(paper.abstract),
          italics: true,
          size: 21,
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 },
    })
  );

  // Keywords
  if (paper.keywords && paper.keywords.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Keywords: ',
            bold: true,
            size: 20,
          }),
          new TextRun({
            text: paper.keywords.join(', '),
            size: 20,
            italics: true,
          }),
        ],
        spacing: { after: 350 },
      })
    );
  }

  // Sections
  for (const section of paper.sections) {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 120 },
      })
    );

    const paragraphs = section.content.split('\n\n').filter(Boolean);
    for (const p of paragraphs) {
      // If table line, format as monospaced/clean table block
      if (p.includes('|') && p.includes('\n|')) {
        const lines = p.split('\n');
        for (const line of lines) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  font: 'Consolas',
                  size: 18,
                }),
              ],
              spacing: { after: 40 },
            })
          );
        }
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      } else if (p.startsWith('$$') && p.endsWith('$$')) {
        // LaTeX Equation block
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[Equation] ${p.replace(/\$\$/g, '').trim()}`,
                italics: true,
                bold: true,
                font: 'Cambria Math',
                size: 22,
                color: '312E81',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 120 },
          })
        );
      } else {
        // Normal paragraph - parse inline bold/italic
        const textRuns: TextRun[] = [];
        const parts = p.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        for (const part of parts) {
          if (!part) continue;
          if (part.startsWith('**') && part.endsWith('**')) {
            textRuns.push(
              new TextRun({
                text: part.slice(2, -2),
                bold: true,
                size: 22,
              })
            );
          } else if (part.startsWith('*') && part.endsWith('*')) {
            textRuns.push(
              new TextRun({
                text: part.slice(1, -1),
                italics: true,
                size: 22,
              })
            );
          } else {
            textRuns.push(
              new TextRun({
                text: part.replace(/`([^`]+)`/g, '$1'),
                size: 22,
              })
            );
          }
        }

        children.push(
          new Paragraph({
            children: textRuns,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 160 },
          })
        );
      }
    }
  }

  // References Section
  if (paper.references && paper.references.length > 0) {
    children.push(
      new Paragraph({
        text: `REFERENCES (${paper.citationStyle || 'IEEE'})`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 140 },
      })
    );

    for (const ref of paper.references) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${ref.index}] `,
              bold: true,
              size: 20,
              color: '1E3A8A',
            }),
            new TextRun({
              text: ref.citation,
              size: 20,
            }),
            ...(ref.doi
              ? [
                  new TextRun({
                    text: ` DOI: ${ref.doi}`,
                    italics: true,
                    size: 18,
                    color: '4338CA',
                  }),
                ]
              : []),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, getSafeFilename(paper.title, 'docx'));
}

/**
 * =========================================================================
 * 2. DIRECT PLAIN TEXT FILE (.TXT) GENERATOR
 * =========================================================================
 */
export function exportPaperToTxt(paper: GeneratedPaper): void {
  const lineSeparator = '='.repeat(80);
  const sectionSeparator = '-'.repeat(80);

  let txt = `${lineSeparator}\n`;
  txt += `${paper.title.toUpperCase()}\n`;
  if (paper.subtitle) {
    txt += `${paper.subtitle}\n`;
  }
  txt += `${lineSeparator}\n\n`;

  txt += `AUTHORS:     ${paper.authors}\n`;
  txt += `AFFILIATION: ${paper.affiliation}\n`;
  txt += `DATE:        ${new Date().toLocaleDateString()}\n`;
  txt += `FORMAT:      ${paper.citationStyle} Citation Standard\n`;
  txt += `GENERATED BY: bumbresearch Studio\n\n`;

  txt += `${sectionSeparator}\n`;
  txt += `ABSTRACT\n`;
  txt += `${sectionSeparator}\n`;
  txt += `${cleanMarkdown(paper.abstract)}\n\n`;

  if (paper.keywords && paper.keywords.length > 0) {
    txt += `KEYWORDS: ${paper.keywords.join(', ')}\n\n`;
  }

  for (let i = 0; i < paper.sections.length; i++) {
    const sec = paper.sections[i];
    txt += `${sectionSeparator}\n`;
    txt += `SECTION ${i + 1}: ${sec.title.toUpperCase()}\n`;
    txt += `${sectionSeparator}\n\n`;

    const cleanedContent = cleanMarkdown(sec.content);
    txt += `${cleanedContent}\n\n`;
  }

  if (paper.references && paper.references.length > 0) {
    txt += `${sectionSeparator}\n`;
    txt += `REFERENCES (${paper.citationStyle})\n`;
    txt += `${sectionSeparator}\n\n`;

    for (const ref of paper.references) {
      txt += `[${ref.index}] ${ref.citation}`;
      if (ref.doi) {
        txt += ` (DOI: ${ref.doi})`;
      }
      txt += '\n\n';
    }
  }

  txt += `${lineSeparator}\n`;
  txt += `End of Academic Manuscript • Produced via bumbresearch\n`;
  txt += `${lineSeparator}\n`;

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, getSafeFilename(paper.title, 'txt'));
}

/**
 * =========================================================================
 * 3. DIRECT ACADEMIC PDF (.PDF) GENERATOR
 * =========================================================================
 */
export function exportPaperToPdf(paper: GeneratedPaper): void {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = 60;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = 60;
      // Header on subsequent pages
      doc.setFont('times', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text(`bumbresearch Academic Paper • ${paper.title.slice(0, 50)}...`, margin, 35);
      doc.setDrawColor(210, 210, 210);
      doc.line(margin, 42, pageWidth - margin, 42);
    }
  };

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 30);
  const titleLines = doc.splitTextToSize(paper.title, contentWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 22 + 10;

  // Subtitle
  if (paper.subtitle) {
    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const subLines = doc.splitTextToSize(paper.subtitle, contentWidth);
    doc.text(subLines, pageWidth / 2, y, { align: 'center' });
    y += subLines.length * 15 + 10;
  }

  // Authors & Affiliation
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text(paper.authors, pageWidth / 2, y, { align: 'center' });
  y += 16;

  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 100, 100);
  doc.text(paper.affiliation, pageWidth / 2, y, { align: 'center' });
  y += 24;

  // Decorative divider
  doc.setDrawColor(180, 180, 200);
  doc.setLineWidth(1);
  doc.line(margin + 40, y, pageWidth - margin - 40, y);
  y += 20;

  // Abstract Box
  checkPageBreak(120);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(1.5);

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(67, 56, 202);
  doc.text('ABSTRACT', margin, y);
  y += 16;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const cleanAbs = cleanMarkdown(paper.abstract);
  const absLines = doc.splitTextToSize(cleanAbs, contentWidth);
  checkPageBreak(absLines.length * 14 + 10);
  doc.text(absLines, margin, y);
  y += absLines.length * 14 + 16;

  // Keywords
  if (paper.keywords && paper.keywords.length > 0) {
    checkPageBreak(25);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text('Keywords: ', margin, y);
    const kwWidth = doc.getTextWidth('Keywords: ');
    doc.setFont('times', 'italic');
    doc.setTextColor(90, 90, 90);
    doc.text(paper.keywords.join(', '), margin + kwWidth, y);
    y += 24;
  }

  // Sections
  for (let i = 0; i < paper.sections.length; i++) {
    const sec = paper.sections[i];
    checkPageBreak(50);

    // Section title
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    const secTitleLines = doc.splitTextToSize(sec.title, contentWidth);
    doc.text(secTitleLines, margin, y);
    y += secTitleLines.length * 16 + 8;

    // Underline section title lightly
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, y - 4, margin + 200, y - 4);

    // Section paragraphs
    const paragraphs = sec.content.split('\n\n').filter(Boolean);
    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(40, 40, 40);

    for (const rawP of paragraphs) {
      if (rawP.startsWith('$$') && rawP.endsWith('$$')) {
        // Equation
        checkPageBreak(35);
        doc.setFillColor(245, 247, 250);
        doc.rect(margin, y - 10, contentWidth, 24, 'F');
        doc.setFont('times', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(49, 46, 129);
        doc.text(`Formula: ${rawP.replace(/\$\$/g, '').trim()}`, pageWidth / 2, y + 4, { align: 'center' });
        doc.setFont('times', 'normal');
        doc.setTextColor(40, 40, 40);
        y += 28;
      } else {
        const cleanedP = cleanMarkdown(rawP);
        const lines = doc.splitTextToSize(cleanedP, contentWidth);
        checkPageBreak(lines.length * 14 + 10);
        doc.text(lines, margin, y);
        y += lines.length * 14 + 10;
      }
    }
    y += 8;
  }

  // References
  if (paper.references && paper.references.length > 0) {
    checkPageBreak(60);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(`References (${paper.citationStyle || 'IEEE'})`, margin, y);
    y += 20;

    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);

    for (const ref of paper.references) {
      const refText = `[${ref.index}] ${ref.citation}${ref.doi ? ` DOI: ${ref.doi}` : ''}`;
      const refLines = doc.splitTextToSize(refText, contentWidth);
      checkPageBreak(refLines.length * 12 + 6);
      doc.text(refLines, margin, y);
      y += refLines.length * 12 + 6;
    }
  }

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(140, 140, 140);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
  }

  doc.save(getSafeFilename(paper.title, 'pdf'));
}

/**
 * =========================================================================
 * 4. PROJECT-BASED EXPORT HELPERS (For SimpleEditor and ExportModal)
 * =========================================================================
 */
export async function exportProjectToDocx(project: Project): Promise<void> {
  const docObj = project.documents[0];
  const totalWords = docObj?.sections?.reduce((sum, s) => sum + s.content.trim().split(/\s+/).filter(Boolean).length, 0) || 1500;
  const paper: GeneratedPaper = {
    id: `temp-${project.id}`,
    query: project.title,
    title: project.title,
    subtitle: `Domain: ${project.domain}`,
    authors: 'Lead Academic Researcher',
    affiliation: 'bumbresearch Scholarly Consortium',
    abstract: docObj?.sections[0]?.content || 'Academic manuscript prepared in bumbresearch.',
    keywords: [project.domain, 'Empirical Research', 'Methodology'],
    citationStyle: project.citationStyle || 'IEEE',
    modelUsed: 'Gemini 3.8 Flash Academic',
    createdAt: new Date().toISOString(),
    sections: (docObj?.sections || []).map((s, idx) => ({
      id: s.id || `sec-${idx}`,
      title: s.title,
      content: s.content,
      wordCount: s.wordCount || s.content.split(/\s+/).length,
    })),
    references: (project.citations || []).map((c, idx) => ({
      id: c.id || `ref-${idx + 1}`,
      index: idx + 1,
      citation: c.fullBibliography || `${c.authors} (${c.year}). ${c.title}.`,
      doi: c.doi,
    })),
    metrics: {
      wordCount: totalWords,
      readingTimeMinutes: Math.max(1, Math.ceil(totalWords / 200)),
      citationsCount: project.citations?.length || 0,
      equationsCount: 3,
      tablesCount: 2,
    },
    fullMarkdown: '',
  };

  return exportPaperToDocx(paper);
}

export function exportProjectToTxt(project: Project): void {
  const docObj = project.documents[0];
  const totalWords = docObj?.sections?.reduce((sum, s) => sum + s.content.trim().split(/\s+/).filter(Boolean).length, 0) || 1500;
  const paper: GeneratedPaper = {
    id: `temp-${project.id}`,
    query: project.title,
    title: project.title,
    subtitle: `Domain: ${project.domain}`,
    authors: 'Lead Academic Researcher',
    affiliation: 'bumbresearch Scholarly Consortium',
    abstract: docObj?.sections[0]?.content || 'Academic manuscript prepared in bumbresearch.',
    keywords: [project.domain, 'Empirical Research'],
    citationStyle: project.citationStyle || 'IEEE',
    modelUsed: 'Gemini 3.8 Flash Academic',
    createdAt: new Date().toISOString(),
    sections: (docObj?.sections || []).map((s, idx) => ({
      id: s.id || `sec-${idx}`,
      title: s.title,
      content: s.content,
      wordCount: s.wordCount || s.content.split(/\s+/).length,
    })),
    references: (project.citations || []).map((c, idx) => ({
      id: c.id || `ref-${idx + 1}`,
      index: idx + 1,
      citation: c.fullBibliography || `${c.authors} (${c.year}). ${c.title}.`,
      doi: c.doi,
    })),
    metrics: {
      wordCount: totalWords,
      readingTimeMinutes: Math.max(1, Math.ceil(totalWords / 200)),
      citationsCount: project.citations?.length || 0,
      equationsCount: 3,
      tablesCount: 2,
    },
    fullMarkdown: '',
  };

  exportPaperToTxt(paper);
}

export function exportProjectToPdf(project: Project): void {
  const docObj = project.documents[0];
  const totalWords = docObj?.sections?.reduce((sum, s) => sum + s.content.trim().split(/\s+/).filter(Boolean).length, 0) || 1500;
  const paper: GeneratedPaper = {
    id: `temp-${project.id}`,
    query: project.title,
    title: project.title,
    subtitle: `Domain: ${project.domain}`,
    authors: 'Lead Academic Researcher',
    affiliation: 'bumbresearch Scholarly Consortium',
    abstract: docObj?.sections[0]?.content || 'Academic manuscript prepared in bumbresearch.',
    keywords: [project.domain, 'Empirical Research'],
    citationStyle: project.citationStyle || 'IEEE',
    modelUsed: 'Gemini 3.8 Flash Academic',
    createdAt: new Date().toISOString(),
    sections: (docObj?.sections || []).map((s, idx) => ({
      id: s.id || `sec-${idx}`,
      title: s.title,
      content: s.content,
      wordCount: s.wordCount || s.content.split(/\s+/).length,
    })),
    references: (project.citations || []).map((c, idx) => ({
      id: c.id || `ref-${idx + 1}`,
      index: idx + 1,
      citation: c.fullBibliography || `${c.authors} (${c.year}). ${c.title}.`,
      doi: c.doi,
    })),
    metrics: {
      wordCount: totalWords,
      readingTimeMinutes: Math.max(1, Math.ceil(totalWords / 200)),
      citationsCount: project.citations?.length || 0,
      equationsCount: 3,
      tablesCount: 2,
    },
    fullMarkdown: '',
  };

  exportPaperToPdf(paper);
}
