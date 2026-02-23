import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { formatCurrency, formatPercent, formatDate } from '@/shared/lib/utils';
import type {
  ROIMetrics,
  NRRMetrics,
  AgentFleet,
  InsightList,
  TokenEfficiency,
  SecurityHealth,
} from '@/shared/schemas';

// ============================================
// PDF Export
// ============================================

interface DashboardExportData {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  roi?: ROIMetrics;
  nrr?: NRRMetrics;
  agentFleet?: AgentFleet;
  insights?: InsightList;
  tokenEfficiency?: TokenEfficiency;
  security?: SecurityHealth;
}

export async function exportToPDF(data: DashboardExportData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Colors
  const primaryColor = '#1E3A8A';
  const textColor = '#0F172A';
  const mutedColor = '#64748B';

  // Title
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text(data.title, pageWidth / 2, y, { align: 'center' });
  y += 10;

  if (data.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(mutedColor);
    doc.text(data.subtitle, pageWidth / 2, y, { align: 'center' });
    y += 10;
  }

  // Generated date
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(data.generatedAt)}`, pageWidth / 2, y, { align: 'center' });
  y += 20;

  // ROI Section
  if (data.roi) {
    y = addSection(doc, 'ROI Metrics', y, primaryColor);
    doc.setFontSize(11);
    doc.setTextColor(textColor);

    const roiData = [
      ['Total ROI', `${data.roi.totalROI}%`],
      ['Labor Savings', formatCurrency(data.roi.laborSavings)],
      ['Efficiency Gains', formatCurrency(data.roi.efficiencyGains)],
      ['Revenue Uplift', formatCurrency(data.roi.revenueUplift)],
      ['Token Costs', formatCurrency(data.roi.tokenCosts)],
      ['Net Value', formatCurrency(data.roi.netValue)],
    ];

    y = addTable(doc, roiData, y);
    y += 10;
  }

  // NRR Section
  if (data.nrr) {
    y = addSection(doc, 'Net Revenue Retention', y, primaryColor);
    const nrrData = [
      ['Current NRR', `${data.nrr.current.toFixed(1)}%`],
      ['Target', `${data.nrr.target}%`],
      ['Expansion Revenue', formatCurrency(data.nrr.expansionRevenue)],
      ['Contraction', formatCurrency(data.nrr.contractionRevenue)],
      ['Churned', formatCurrency(data.nrr.churnedRevenue)],
    ];

    y = addTable(doc, nrrData, y);
    y += 10;
  }

  // Agent Fleet Section
  if (data.agentFleet) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    y = addSection(doc, 'Agent Fleet Status', y, primaryColor);
    const healthy = data.agentFleet.filter((a) => a.status === 'healthy').length;
    const total = data.agentFleet.length;

    doc.setFontSize(11);
    doc.text(`Fleet Health: ${healthy}/${total} agents healthy`, 20, y);
    y += 15;

    data.agentFleet.forEach((agent) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(10);
      doc.text(
        `${agent.name}: ${agent.status} | ${agent.uptime.toFixed(2)}% uptime | ${agent.avgLatencyMs}ms latency`,
        20,
        y
      );
      y += 7;
    });
    y += 10;
  }

  // Insights Section
  if (data.insights && data.insights.length > 0) {
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    y = addSection(doc, 'Key Insights', y, primaryColor);

    data.insights.slice(0, 5).forEach((insight) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.setTextColor(textColor);
      doc.text(`• ${insight.title}`, 20, y);
      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(mutedColor);
      const lines = doc.splitTextToSize(insight.summary, pageWidth - 40);
      doc.text(lines, 25, y);
      y += lines.length * 5 + 5;
    });
  }

  return doc.output('blob');
}

function addSection(doc: jsPDF, title: string, y: number, color: string): number {
  doc.setFontSize(14);
  doc.setTextColor(color);
  doc.text(title, 20, y);
  y += 2;
  doc.setDrawColor(color);
  doc.line(20, y, 80, y);
  return y + 10;
}

function addTable(doc: jsPDF, data: string[][], startY: number): number {
  let y = startY;
  doc.setFontSize(10);

  data.forEach(([label, value]) => {
    doc.setTextColor('#64748B');
    doc.text(label, 20, y);
    doc.setTextColor('#0F172A');
    doc.text(value, 100, y);
    y += 7;
  });

  return y;
}

// ============================================
// PowerPoint Export
// ============================================

export async function exportToPPTX(data: DashboardExportData): Promise<Blob> {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'Elevates Dashboard';
  pptx.title = data.title;
  pptx.subject = 'Executive Dashboard Report';

  // Define master slide
  pptx.defineSlideMaster({
    title: 'ELEVATES_MASTER',
    background: { color: '0A0F1C' },
    objects: [
      {
        text: {
          text: 'ELEVATES',
          options: {
            x: 0.5,
            y: 0.2,
            w: 2,
            h: 0.3,
            fontSize: 12,
            color: '3B82F6',
            bold: true,
          },
        },
      },
    ],
  });

  // Title Slide
  const titleSlide = pptx.addSlide({ masterName: 'ELEVATES_MASTER' });
  titleSlide.addText(data.title, {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1,
    fontSize: 36,
    color: 'FFFFFF',
    bold: true,
    align: 'center',
  });

  if (data.subtitle) {
    titleSlide.addText(data.subtitle, {
      x: 0.5,
      y: 3,
      w: 9,
      h: 0.5,
      fontSize: 18,
      color: '94A3B8',
      align: 'center',
    });
  }

  titleSlide.addText(`Generated: ${formatDate(data.generatedAt)}`, {
    x: 0.5,
    y: 5,
    w: 9,
    h: 0.3,
    fontSize: 12,
    color: '64748B',
    align: 'center',
  });

  // ROI Slide
  if (data.roi) {
    const roiSlide = pptx.addSlide({ masterName: 'ELEVATES_MASTER' });
    roiSlide.addText('ROI Performance', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 24,
      color: 'FFFFFF',
      bold: true,
    });

    // Big ROI number
    roiSlide.addText(`${data.roi.totalROI}%`, {
      x: 0.5,
      y: 1.5,
      w: 4,
      h: 1.5,
      fontSize: 72,
      color: '10B981',
      bold: true,
    });

    roiSlide.addText('Total ROI', {
      x: 0.5,
      y: 3,
      w: 4,
      h: 0.4,
      fontSize: 14,
      color: '94A3B8',
    });

    // Metrics grid
    const metrics = [
      { label: 'Labor Savings', value: formatCurrency(data.roi.laborSavings), color: '10B981' },
      { label: 'Efficiency Gains', value: formatCurrency(data.roi.efficiencyGains), color: '10B981' },
      { label: 'Revenue Uplift', value: formatCurrency(data.roi.revenueUplift), color: '10B981' },
      { label: 'Token Costs', value: formatCurrency(data.roi.tokenCosts), color: 'EF4444' },
    ];

    metrics.forEach((metric, i) => {
      const x = 5 + (i % 2) * 2.5;
      const y = 1.5 + Math.floor(i / 2) * 1.5;

      roiSlide.addText(metric.value, {
        x,
        y,
        w: 2.3,
        h: 0.6,
        fontSize: 20,
        color: metric.color,
        bold: true,
      });

      roiSlide.addText(metric.label, {
        x,
        y: y + 0.5,
        w: 2.3,
        h: 0.4,
        fontSize: 11,
        color: '94A3B8',
      });
    });

    // Net Value
    roiSlide.addShape('rect', {
      x: 5,
      y: 4.5,
      w: 4.5,
      h: 1,
      fill: { color: '10B981', transparency: 90 },
      line: { color: '10B981', width: 1 },
    });

    roiSlide.addText(`Net Value: ${formatCurrency(data.roi.netValue)}`, {
      x: 5,
      y: 4.7,
      w: 4.5,
      h: 0.6,
      fontSize: 18,
      color: '10B981',
      bold: true,
      align: 'center',
    });
  }

  // Insights Slide
  if (data.insights && data.insights.length > 0) {
    const insightSlide = pptx.addSlide({ masterName: 'ELEVATES_MASTER' });
    insightSlide.addText('Key Insights', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.6,
      fontSize: 24,
      color: 'FFFFFF',
      bold: true,
    });

    data.insights.slice(0, 3).forEach((insight, i) => {
      const y = 1.5 + i * 1.5;

      insightSlide.addText(insight.title, {
        x: 0.5,
        y,
        w: 9,
        h: 0.5,
        fontSize: 16,
        color: 'FFFFFF',
        bold: true,
      });

      insightSlide.addText(insight.summary, {
        x: 0.5,
        y: y + 0.5,
        w: 9,
        h: 0.8,
        fontSize: 12,
        color: '94A3B8',
      });
    });
  }

  return pptx.write({ outputType: 'blob' }) as Promise<Blob>;
}

// ============================================
// Download Helpers
// ============================================

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportDashboard(
  format: 'pdf' | 'pptx',
  data: DashboardExportData
): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `elevates-dashboard-${timestamp}`;

  if (format === 'pdf') {
    const blob = await exportToPDF(data);
    downloadBlob(blob, `${filename}.pdf`);
  } else {
    const blob = await exportToPPTX(data);
    downloadBlob(blob, `${filename}.pptx`);
  }
}
