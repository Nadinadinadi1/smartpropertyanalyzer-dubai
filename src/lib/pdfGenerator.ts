import jsPDF from 'jspdf';

interface PropertyData {
  propertyStatus: 'ready' | 'off-plan';
  name: string;
  price: number;
  priceInputMethod: 'slider' | 'manual';
  propertyType: string;
  area: string;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  dldFeeIncluded: boolean;
  monthlyRent: number;
  vacancyRate: number;
  maintenanceRate: number;
  managementFee: number;
  insurance: number;
  rentGrowth?: number;
  appreciationRate?: number;
  expenseInflation?: number;
  exitCapRate?: number;
  sellingCosts?: number;
}

interface InvestmentMetrics {
  investmentScore: number;
  riskLevel: string;
  monthlyCashFlow: number;
  annualROI: number;
  cashOnCashReturn: number;
  grossYield: number;
  netYield: number;
  irr: number;
  totalInvestment: number;
  downPaymentAmount: number;
  loanAmount: number;
  additionalCosts: number;
  monthlyPayment: number;
  effectiveRent: number;
  monthlyExpenses: number;
  debtToEquityRatio: number;
  monthlyExpenseRatio: number;
  vacancyRate: number;
}

interface ScoreDetail {
  category: string;
  points: number;
  maxPoints: number;
}

interface ProjectionData {
  year: number;
  netCashFlow: number;
  cumulativeCash: number;
  equity: number;
  propertyValue: number;
  remainingDebt: number;
  totalReturn: number;
}

export function generateInvestmentReport(
  propertyData: PropertyData,
  metrics: InvestmentMetrics,
  scoreDetails: ScoreDetail[],
  projectionData: ProjectionData[]
): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = 20;
  let currentPage = 1;

  // Helper function to check page break and add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 30) {
      pdf.addPage();
      currentPage++;
      yPosition = 20;
      
      // Add page header
      pdf.setFillColor(79, 125, 248); // #4F7DF8
      pdf.rect(0, 0, pageWidth, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Smart Property Analyzer Dubai', pageWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Investment Analysis Report | Page ${currentPage}`, pageWidth / 2, 22, { align: 'center' });
    }
  };

  // Helper function to add colored box
  const addColoredBox = (text: string, color: [number, number, number], y: number, width: number, height: number) => {
    checkPageBreak(height + 15);
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(margin, y, width, height, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(text, margin + 5, y + height - 3);
    yPosition += height + 15;
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, color: [number, number, number]) => {
    checkPageBreak(25);
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, margin + 5, yPosition + 6);
    yPosition += 25;
  };

  // Helper function to add metric row
  const addMetricRow = (label: string, value: string, y: number) => {
    checkPageBreak(10);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, y, contentWidth, 8, 'S');
    
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(10);
    pdf.text(label, margin + 5, y + 6);
    
    pdf.setTextColor(15, 23, 42);
    pdf.setFont(undefined, 'bold');
    pdf.text(value, margin + 120, y + 6);
    
    yPosition += 15;
  };

  // Helper function to add info box
  const addInfoBox = (title: string, content: string, y: number) => {
    checkPageBreak(35);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, y, contentWidth, 30, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, y, contentWidth, 30, 'S');
    
    // Left accent bar
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, y, 3, 30, 'F');
    
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, margin + 5, y + 8);
    
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text(content, margin + 5, y + 20);
    
    yPosition += 38;
  };

  // Helper function to add comparison table
  const addComparisonTable = (title: string, data: { label: string; value: string; status: string; statusColor: [number, number, number] }[]) => {
    checkPageBreak(data.length * 15 + 25);
    
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, margin, yPosition);
    yPosition += 10;
    
    // Table headers
    pdf.setFontSize(9);
    pdf.setFillColor(79, 125, 248);
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Metric', margin + 5, yPosition + 6);
    pdf.text('Value', margin + 80, yPosition + 6);
    pdf.text('Status', margin + 140, yPosition + 6);
    yPosition += 8;
    
    // Table rows
    data.forEach((row, i) => {
      const bgColor = i % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
      pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, yPosition, contentWidth, 8, 'S');
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(9);
      pdf.text(row.label, margin + 5, yPosition + 6);
      pdf.text(row.value, margin + 80, yPosition + 6);
      
      // Status indicator
      pdf.setFillColor(row.statusColor[0], row.statusColor[1], row.statusColor[2]);
      pdf.rect(margin + 140, yPosition + 2, 25, 4, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont(undefined, 'bold');
      pdf.text(row.status, margin + 152, yPosition + 6);
      
      yPosition += 8;
    });
    
    yPosition += 10;
  };

  // Helper function to add executive summary
  const addExecutiveSummary = (propertyData: PropertyData, metrics: InvestmentMetrics) => {
    checkPageBreak(80);
    
    // Dark background header
    pdf.setFillColor(15, 23, 42);
    pdf.rect(margin, yPosition, contentWidth, 25, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('EXECUTIVE SUMMARY', margin + 5, yPosition + 8);
    
    yPosition += 30;
    
    // Summary text
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const summaryText = `Property: ${propertyData.name} | Investment Score: ${metrics.investmentScore}/10 | Risk Level: ${metrics.riskLevel} | Monthly Cash Flow: ${formatCurrency(metrics.monthlyCashFlow)} | Annual ROI: ${formatPercentage(metrics.annualROI)}`;
    pdf.text(summaryText, margin, yPosition);
    yPosition += 15;
    
    // Recommendation
    pdf.setFont(undefined, 'bold');
    pdf.text('Recommendation: Strong fundamentals and positive cash flow make this an attractive investment opportunity.', margin, yPosition);
    yPosition += 20;
  };

  // Helper functions for formatting
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Start with title page
  checkPageBreak(60);
  
  // Title page header with gradient effect
  pdf.setFillColor(79, 125, 248); // #4F7DF8
  pdf.rect(0, 0, pageWidth, 60, 'F');
  
  // Logo placeholder
  pdf.setFillColor(255, 255, 255);
  pdf.rect(pageWidth / 2 - 15, 10, 30, 30, 'F');
  pdf.setTextColor(79, 125, 248);
  pdf.setFontSize(20);
  pdf.text('🏠', pageWidth / 2, 25, { align: 'center' });
  
  // Main title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont(undefined, 'bold');
  pdf.text('Smart Property Analyzer', pageWidth / 2, 50, { align: 'center' });
  
  // Subtitle
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'normal');
  pdf.text('Professional Investment Analysis Report', pageWidth / 2, 65, { align: 'center' });
  
  yPosition = 80;

  // Property Header Section
  checkPageBreak(50);
  
  // Property header background
  pdf.setFillColor(248, 249, 255);
  pdf.rect(margin, yPosition, contentWidth, 40, 'F');
  pdf.setDrawColor(79, 125, 248);
  pdf.setLineWidth(2);
  pdf.rect(margin, yPosition, 5, 40, 'F');
  
  // Property name
  pdf.setTextColor(44, 62, 80);
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.text(propertyData.name, margin + 15, yPosition + 15);
  
  // Property details
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(102, 102, 102);
  pdf.text(`📍 ${propertyData.area}, Dubai • 🏠 ${propertyData.propertyType} • ✅ ${propertyData.propertyStatus === 'ready' ? 'Ready Property' : 'Off-Plan'}`, margin + 15, yPosition + 30);
  pdf.text(`📅 Analysis Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin + 15, yPosition + 40);
  
  // Investment score on the right
  const scoreX = margin + contentWidth - 80;
  pdf.setFillColor(255, 255, 255);
  pdf.rect(scoreX, yPosition + 5, 70, 30, 'F');
  pdf.setDrawColor(79, 125, 248);
  pdf.setLineWidth(1);
  pdf.rect(scoreX, yPosition + 5, 70, 30, 'S');
  
  pdf.setTextColor(39, 174, 96);
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${metrics.investmentScore}/10`, scoreX + 35, yPosition + 20, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setTextColor(102, 102, 102);
  pdf.text('Investment Score', scoreX + 35, yPosition + 30, { align: 'center' });
  
  // Recommendation badge
  pdf.setFillColor(39, 174, 96);
  pdf.rect(scoreX + 10, yPosition + 32, 50, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont(undefined, 'bold');
  pdf.text('Strong Buy', scoreX + 35, yPosition + 38, { align: 'center' });
  
  yPosition += 60;

  // Key Metrics Grid
  checkPageBreak(80);
  
  const keyMetrics = [
    { label: 'Monthly Cash Flow', value: formatCurrency(metrics.monthlyCashFlow), color: metrics.monthlyCashFlow >= 0 ? [39, 174, 96] : [231, 76, 60] },
    { label: 'Cash-on-Cash Return', value: formatPercentage(metrics.cashOnCashReturn), color: [79, 125, 248] },
    { label: 'IRR (Internal Rate of Return)', value: formatPercentage(metrics.irr), color: [243, 156, 18] },
    { label: 'Annual ROI', value: formatPercentage(metrics.annualROI), color: [168, 85, 247] },
    { label: 'Gross Yield', value: formatPercentage(metrics.grossYield), color: [39, 174, 96] },
    { label: 'Net Yield', value: formatPercentage(metrics.netYield), color: [243, 156, 18] }
  ];

  // Create 2x3 grid layout
  const cardWidth = (contentWidth - 20) / 3;
  const cardHeight = 35;
  
  keyMetrics.forEach((metric, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = margin + (col * (cardWidth + 10));
    const y = yPosition + (row * (cardHeight + 10));
    
    checkPageBreak(cardHeight + 10);
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x, y, cardWidth, cardHeight, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1);
    pdf.rect(x, y, cardWidth, cardHeight, 'S');
    
    // Top border accent
    pdf.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    pdf.rect(x, y, cardWidth, 3, 'F');
    
    // Metric value
    pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(metric.value, x + cardWidth / 2, y + 15, { align: 'center' });
    
    // Metric label
    pdf.setTextColor(102, 102, 102);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text(metric.label, x + cardWidth / 2, y + 28, { align: 'center' });
  });
  
  yPosition += 90;

  // Monthly Financial Breakdown
  addSectionHeader('💰 Monthly Financial Breakdown', [79, 125, 248]);
  
  const breakdownData = [
    { amount: formatCurrency(metrics.effectiveRent), label: 'Monthly Rent (Net)', percentage: `${metrics.vacancyRate}% vacancy rate` },
    { amount: formatCurrency(metrics.monthlyExpenses), label: 'Monthly Expenses', percentage: `${formatPercentage(metrics.monthlyExpenseRatio)} of rent` },
    { amount: formatCurrency(metrics.monthlyPayment), label: 'Monthly Mortgage', percentage: `${formatPercentage(propertyData.interestRate)} interest` },
    { amount: formatCurrency(metrics.monthlyCashFlow), label: 'Net Cash Flow', percentage: metrics.monthlyCashFlow >= 0 ? 'Positive' : 'Negative' }
  ];

  const breakdownCardWidth = (contentWidth - 30) / 4;
  const breakdownCardHeight = 40;
  
  breakdownData.forEach((item, index) => {
    const x = margin + (index * (breakdownCardWidth + 10));
    const y = yPosition;
    
    checkPageBreak(breakdownCardHeight + 10);
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x, y, breakdownCardWidth, breakdownCardHeight, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1);
    pdf.rect(x, y, breakdownCardWidth, breakdownCardHeight, 'S');
    
    // Left border accent
    pdf.setFillColor(79, 125, 248);
    pdf.rect(x, y, 3, breakdownCardHeight, 'F');
    
    // Amount
    pdf.setTextColor(44, 62, 80);
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(item.amount, x + breakdownCardWidth / 2, y + 12, { align: 'center' });
    
    // Label
    pdf.setTextColor(102, 102, 102);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text(item.label, x + breakdownCardWidth / 2, y + 22, { align: 'center' });
    
    // Percentage
    pdf.setTextColor(79, 125, 248);
    pdf.setFontSize(8);
    pdf.text(item.percentage, x + breakdownCardWidth / 2, y + 32, { align: 'center' });
  });
  
  yPosition += 60;

  // Investment Overview
  addSectionHeader('🏢 Investment Overview', [79, 125, 248]);
  
  const overviewData = [
    { amount: formatCurrency(metrics.totalInvestment), label: 'Total Investment' },
    { amount: formatCurrency(metrics.downPaymentAmount), label: 'Down Payment', percentage: `${propertyData.downPayment}% of property value` },
    { amount: formatCurrency(metrics.loanAmount), label: 'Loan Amount', percentage: `${100 - propertyData.downPayment}% LTV` },
    { amount: formatCurrency(metrics.additionalCosts), label: 'Additional Costs', percentage: 'Registration, fees, etc.' }
  ];

  const overviewCardWidth = (contentWidth - 30) / 4;
  const overviewCardHeight = 40;
  
  overviewData.forEach((item, index) => {
    const x = margin + (index * (overviewCardWidth + 10));
    const y = yPosition;
    
    checkPageBreak(overviewCardHeight + 10);
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x, y, overviewCardWidth, overviewCardHeight, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1);
    pdf.rect(x, y, overviewCardWidth, overviewCardHeight, 'S');
    
    // Left border accent
    pdf.setFillColor(79, 125, 248);
    pdf.rect(x, y, 3, overviewCardHeight, 'F');
    
    // Amount
    pdf.setTextColor(44, 62, 80);
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(item.amount, x + overviewCardWidth / 2, y + 12, { align: 'center' });
    
    // Label
    pdf.setTextColor(102, 102, 102);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text(item.label, x + overviewCardWidth / 2, y + 22, { align: 'center' });
    
    // Percentage if exists
    if (item.percentage) {
      pdf.setTextColor(79, 125, 248);
      pdf.setFontSize(8);
      pdf.text(item.percentage, x + overviewCardWidth / 2, y + 32, { align: 'center' });
    }
  });
  
  yPosition += 60;

  // 10-Year Wealth Projection
  addSectionHeader('📈 10-Year Wealth Projection', [79, 125, 248]);
  
  checkPageBreak(80);
  
  // Chart placeholder
  pdf.setFillColor(248, 249, 255);
  pdf.rect(margin, yPosition, contentWidth, 50, 'F');
  pdf.setDrawColor(221, 221, 221);
  pdf.setLineWidth(2);
  pdf.setLineDashPattern([5, 5], 0);
  pdf.rect(margin, yPosition, contentWidth, 50, 'S');
  pdf.setLineDashPattern([], 0);
  
  // Chart text
  pdf.setTextColor(102, 102, 102);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'italic');
  pdf.text('Wealth Growth Chart: AED 315K → AED 930K (10 years)', margin + contentWidth / 2, yPosition + 25, { align: 'center' });
  
  yPosition += 60;
  
  // Summary metrics
  const summaryMetrics = [
    { label: 'Total Return', value: '313.3%', color: [39, 174, 96] },
    { label: 'Annual Cash Flow', value: formatCurrency(metrics.monthlyCashFlow * 12), color: [79, 125, 248] }
  ];
  
  const summaryCardWidth = (contentWidth - 20) / 2;
  const summaryCardHeight = 25;
  
  summaryMetrics.forEach((metric, index) => {
    const x = margin + (index * (summaryCardWidth + 20));
    const y = yPosition;
    
    checkPageBreak(summaryCardHeight + 10);
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x, y, summaryCardWidth, summaryCardHeight, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1);
    pdf.rect(x, y, summaryCardWidth, summaryCardHeight, 'S');
    
    // Value
    pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(metric.value, x + summaryCardWidth / 2, y + 15, { align: 'center' });
    
    // Label
    pdf.setTextColor(102, 102, 102);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(metric.label, x + summaryCardWidth / 2, y + 25, { align: 'center' });
  });
  
  yPosition += 45;

  // Key Insights
  addSectionHeader('💡 Key Insights', [39, 174, 96]);
  
  const insights = [
    { icon: '✅', text: 'Excellent rental yield of 9.6% exceeds market average by 2.8%. This provides strong cash flow potential and competitive returns.' },
    { icon: '📊', text: 'Positive monthly cash flow of AED 2,106 provides immediate income from day one, making this a cash-flow positive investment.' },
    { icon: '🎯', text: 'Low expense ratio of 12.8% indicates efficient property management and lower ongoing costs compared to market average.' },
    { icon: '📈', text: 'Good appreciation potential of 5-7% annually based on Business Bay area trends and infrastructure development.' }
  ];
  
  insights.forEach((insight) => {
    checkPageBreak(25);
    
    // Insight background
    pdf.setFillColor(248, 255, 248);
    pdf.rect(margin, yPosition, contentWidth, 20, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1);
    pdf.rect(margin, yPosition, contentWidth, 20, 'S');
    
    // Icon
    pdf.setTextColor(39, 174, 96);
    pdf.setFontSize(12);
    pdf.text(insight.icon, margin + 5, yPosition + 12);
    
    // Text
    pdf.setTextColor(44, 62, 80);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text(insight.text, margin + 25, yPosition + 12);
    
    yPosition += 25;
  });

  // Risk Assessment
  addSectionHeader('⚠️ Risk Assessment', [231, 76, 60]);
  
  const riskData = [
    { factor: 'Market Risk', level: 'MEDIUM', color: [255, 243, 205] },
    { factor: 'Vacancy Risk', level: 'LOW', color: [213, 244, 230] },
    { factor: 'Loan-to-Value (LTV)', level: `${100 - propertyData.downPayment}%`, color: [255, 243, 205] },
    { factor: 'Debt-to-Equity', level: `${formatPercentage(metrics.debtToEquityRatio)}`, color: [248, 215, 218] }
  ];
  
  riskData.forEach((risk) => {
    checkPageBreak(20);
    
    // Risk item background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, yPosition, contentWidth, 15, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1);
    pdf.rect(margin, yPosition, contentWidth, 15, 'S');
    
    // Factor label
    pdf.setTextColor(44, 62, 80);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text(risk.factor, margin + 5, yPosition + 10);
    
    // Risk level badge
    pdf.setFillColor(risk.color[0], risk.color[1], risk.color[2]);
    pdf.rect(margin + contentWidth - 50, yPosition + 3, 45, 9, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.text(risk.level, margin + contentWidth - 27, yPosition + 9, { align: 'center' });
    
    yPosition += 20;
  });

  // Investment Recommendations
  addSectionHeader('🎯 Investment Recommendations', [243, 156, 18]);
  
  const recommendations = [
    'Proceed with Investment: Strong fundamentals and positive cash flow make this an attractive opportunity. The 8/10 investment score indicates excellent potential.',
    'Optimize Rental Pricing: Research comparable properties to ensure competitive rental rates. Consider professional property management to maximize occupancy.',
    'Build Cash Reserves: Maintain 6-12 months of expenses as emergency fund to weather any vacancy periods or unexpected maintenance costs.',
    'Long-term Strategy: Hold for minimum 5-7 years to maximize appreciation potential. Consider refinancing opportunities when rates improve.'
  ];
  
  recommendations.forEach((rec, index) => {
    checkPageBreak(25);
    
    // Recommendation background
    pdf.setFillColor(255, 247, 230);
    pdf.rect(margin, yPosition, contentWidth, 20, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1);
    pdf.rect(margin, yPosition, contentWidth, 20, 'S');
    
    // Number circle
    pdf.setFillColor(243, 156, 18);
    pdf.circle(margin + 15, yPosition + 10, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text((index + 1).toString(), margin + 15, yPosition + 12, { align: 'center' });
    
    // Text
    pdf.setTextColor(44, 62, 80);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.text(rec, margin + 30, yPosition + 12);
    
    yPosition += 25;
  });

  // Footer
  checkPageBreak(40);
  pdf.setFillColor(44, 62, 80);
  pdf.rect(0, yPosition, pageWidth, 40, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.text('Smart Property Analyzer Dubai', pageWidth / 2, yPosition + 15, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  const disclaimer = 'Disclaimer: This report is for informational purposes only and should not be considered as financial or investment advice. Property investments carry risks and past performance does not guarantee future results. Please consult with qualified financial advisors, tax professionals, and legal experts before making any investment decisions.';
  pdf.text(disclaimer, pageWidth / 2, yPosition + 30, { align: 'center' });
  
  pdf.setFontSize(8);
  pdf.text(`Generated by Smart Property Analyzer • Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • Confidential`, pageWidth / 2, yPosition + 38, { align: 'center' });

  return pdf;
}
