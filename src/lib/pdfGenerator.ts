import { jsPDF } from 'jspdf';
import { PopItem } from '../types';

export function generatePdfBlobUrl(pop: PopItem): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // Header Box
  doc.setFillColor(13, 148, 136); // Teal #0d9488
  doc.rect(margin, y, contentWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PROCEDIMENTO OPERACIONAL PADRÃO - POP', margin + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${pop.code} | Versão: ${pop.version} | Atualizado: ${pop.lastUpdated}`, margin + 5, y + 16);

  y += 28;

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(pop.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 4;

  // Metadata Table
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 18, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  
  doc.text(`Categoria: ${pop.category}`, margin + 3, y + 5);
  doc.text(`Autor: ${pop.author}`, margin + 3, y + 10);
  doc.text(`Revisão: ${pop.revisedBy}`, margin + 3, y + 15);

  y += 24;

  // Helper for section headings
  const addSectionHeader = (title: string) => {
    if (y > 260) {
      doc.addPage();
      y = 15;
    }
    doc.setFillColor(224, 242, 254);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(2, 132, 199);
    doc.text(title, margin + 3, y + 4.5);
    y += 9;
  };

  const addParagraph = (text: string, bold = false) => {
    if (y > 260) {
      doc.addPage();
      y = 15;
    }
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(text, contentWidth - 4);
    doc.text(lines, margin + 2, y);
    y += lines.length * 4.5 + 2;
  };

  // Objective
  addSectionHeader('1. OBJETIVO');
  addParagraph(pop.objective);
  y += 2;

  // Target Audience
  addSectionHeader('2. PÚBLICO-ALVO');
  addParagraph(pop.targetAudience);
  y += 2;

  // Materials
  addSectionHeader('3. MATERIAIS NECESSÁRIOS');
  pop.materials.forEach((mat) => {
    addParagraph(`• ${mat}`);
  });
  y += 2;

  // Steps
  addSectionHeader('4. EXECUÇÃO DO PROCEDIMENTO PASSO A PASSO');
  pop.steps.forEach((step) => {
    if (y > 255) {
      doc.addPage();
      y = 15;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`Passo ${step.stepNumber}: ${step.title}`, margin + 2, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const stepLines = doc.splitTextToSize(step.description, contentWidth - 6);
    doc.text(stepLines, margin + 4, y);
    y += stepLines.length * 4 + 3;
  });

  // Risks
  if (pop.risks && pop.risks.length > 0) {
    addSectionHeader('5. RISCOS E AÇÕES PREVENTIVAS');
    pop.risks.forEach((risk) => {
      addParagraph(`⚠ ${risk}`);
    });
    y += 2;
  }

  // References
  if (pop.references) {
    addSectionHeader('6. REFERÊNCIAS NORMATIVAS');
    addParagraph(pop.references);
  }

  // Footer
  const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`EnfermaPOP - Documento Oficial de Enfermagem | Página ${i} de ${totalPages}`, margin, 287);
  }

  return doc.output('datauristring');
}
