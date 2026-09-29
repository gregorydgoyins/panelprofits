const fs = require('fs');
const path = require('path');

/**
 * Pure Node.js Standard PDF-1.4 Generator
 * Builds multi-page, syntactically valid PDF files without external dependencies.
 */
class SimplePdfBuilder {
  constructor() {
    this.pages = [];
  }

  addPage(lines) {
    this.pages.push(lines);
  }

  build() {
    let objId = 1;
    const objects = [];

    // Catalog: obj 1
    const catalogId = objId++;
    // Pages: obj 2
    const pagesId = objId++;
    // Font Helvetica: obj 3
    const fontHelvId = objId++;
    // Font Helvetica-Bold: obj 4
    const fontBoldId = objId++;
    // Font Courier: obj 5
    const fontCourierId = objId++;

    const pageObjIds = [];
    const contentObjIds = [];

    for (let i = 0; i < this.pages.length; i++) {
      pageObjIds.push(objId++);
      contentObjIds.push(objId++);
    }

    objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId] = `<< /Type /Pages /Kids [${pageObjIds.map(id => `${id} 0 R`).join(' ')}] /Count ${this.pages.length} >>`;
    objects[fontHelvId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
    objects[fontBoldId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;
    objects[fontCourierId] = `<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>`;

    for (let i = 0; i < this.pages.length; i++) {
      const pId = pageObjIds[i];
      const cId = contentObjIds[i];
      objects[pId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontHelvId} 0 R /F2 ${fontBoldId} 0 R /F3 ${fontCourierId} 0 R >> >> /Contents ${cId} 0 R >>`;

      // Build content stream
      const streamLines = ['BT'];
      let currentY = 740;

      for (const item of this.pages[i]) {
        if (item.type === 'title') {
          streamLines.push('/F2 18 Tf');
          streamLines.push(`54 ${currentY} Td`);
          streamLines.push(`(${escapePdf(item.text)}) Tj`);
          currentY -= 26;
        } else if (item.type === 'subtitle') {
          streamLines.push('/F2 12 Tf');
          streamLines.push(`54 ${currentY} Td`);
          streamLines.push(`(${escapePdf(item.text)}) Tj`);
          currentY -= 18;
        } else if (item.type === 'meta') {
          streamLines.push('/F1 9 Tf');
          streamLines.push(`54 ${currentY} Td`);
          streamLines.push(`(${escapePdf(item.text)}) Tj`);
          currentY -= 14;
        } else if (item.type === 'heading') {
          currentY -= 10;
          streamLines.push('/F2 12 Tf');
          streamLines.push(`54 ${currentY} Td`);
          streamLines.push(`(${escapePdf(item.text)}) Tj`);
          currentY -= 18;
        } else if (item.type === 'code') {
          streamLines.push('/F3 9 Tf');
          streamLines.push(`64 ${currentY} Td`);
          streamLines.push(`(${escapePdf(item.text)}) Tj`);
          currentY -= 14;
        } else if (item.type === 'paragraph') {
          streamLines.push('/F1 10 Tf');
          // Word wrap paragraph to ~80 chars
          const wrapped = wrapText(item.text, 82);
          for (const line of wrapped) {
            streamLines.push(`54 ${currentY} Td`);
            streamLines.push(`(${escapePdf(line)}) Tj`);
            currentY -= 14;
          }
          currentY -= 6;
        } else if (item.type === 'spacer') {
          currentY -= item.height || 14;
        }
      }

      // Footer
      streamLines.push('/F1 8 Tf');
      streamLines.push(`54 40 Td`);
      streamLines.push(`(PANEL PROFITS RESEARCH TERMINAL  |  PAGE ${i + 1} OF ${this.pages.length}  |  CONFIDENTIAL & PROPRIETARY) Tj`);
      streamLines.push('ET');

      const streamContent = streamLines.join('\n');
      objects[cId] = `<< /Length ${Buffer.byteLength(streamContent)} >>\nstream\n${streamContent}\nendstream`;
    }

    // Assemble PDF binary
    let output = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const offsets = [];

    for (let i = 1; i < objects.length; i++) {
      offsets[i] = Buffer.byteLength(output);
      output += `${i} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefOffset = Buffer.byteLength(output);
    output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

    for (let i = 1; i < objects.length; i++) {
      output += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }

    output += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    return Buffer.from(output, 'latin1');
  }
}

function escapePdf(str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = w;
    } else {
      current += ' ' + w;
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

// -------------------------------------------------------------
// Generate the 5 Papers
// -------------------------------------------------------------

const PAPERS = [
  {
    filePath: 'public/research/white-papers/wp-2026-21m.pdf',
    title: 'The 21 Metric Framework for Sequential Art Valuation',
    subtitle: 'Mathematical Principles Governing Comic Book Asset Pricing',
    meta: 'Authors: Devon Knight, Marcus Vance | Date: September 12, 2026 | Ref: PP-QUANT-2026-021',
    pages: [
      [
        { type: 'title', text: 'The 21 Metric Framework for Sequential Art Valuation' },
        { type: 'subtitle', text: 'Mathematical Principles Governing Comic Book Asset Pricing' },
        { type: 'meta', text: 'Authors: Devon Knight, Marcus Vance | Panel Profits Quantitative Research Group' },
        { type: 'meta', text: 'Publication Date: 2026-09-12 | Reference: PP-QUANT-2026-021 | Classification: Institutional' },
        { type: 'spacer', height: 10 },
        { type: 'heading', text: 'Abstract' },
        { type: 'paragraph', text: 'A rigorous mathematical formulation of the 21 core quantitative financial metrics governing comic book assets. Covers PPIX index weighting, census float velocity, CGC/CBCS grade-delta spreads, FMV clearing yields, CIMA order book depth, and liquidity-adjusted carrying costs across raw and slabbed instruments.' },
        { type: 'heading', text: 'Section 1: Valuation Foundations & Float Dynamics' },
        { type: 'paragraph', text: 'Sequential art assets diverge fundamentally from traditional equity derivatives due to discrete grade quantization and physical census shrinkage. The primary pricing surface is governed by the Grade Delta Spread (GDS), which establishes non-linear clearing price escalation across adjacent CGC increments.' },
        { type: 'code', text: 'GDS(g) = [FMV(g) - FMV(g - 0.2)] / [CGC_Census(g) + epsilon]' },
        { type: 'paragraph', text: 'Metric 1 (GDS) directly measures the incremental premium per grade delta normalized by graded population availability. Metric 2 (RSF, Relative Scarcity Factor) models high-grade scarcity relative to total survivor population.' },
        { type: 'code', text: 'RSF = Census_Grade_9.8 / (Total_Graded_Population + 1.0)' },
      ],
      [
        { type: 'heading', text: 'Section 2: Order Book Depth & Clearing Velocity' },
        { type: 'paragraph', text: 'Unlike high-frequency equity exchanges, comic auctions demonstrate discontinuous liquidity arrivals. Metric 3 (Clearing Velocity Index, CVI) formulates the mean annual frequency of authenticated auction occurrences over 36 trailing months.' },
        { type: 'code', text: 'CVI = Total_Verified_Auction_Transactions_36M / 36.0' },
        { type: 'paragraph', text: 'Metric 4 calculates the Liquidity Discount Carry Cost (LDCC), incorporating vault storage insurance, capital opportunity costs, and seller fee friction.' },
        { type: 'code', text: 'LDCC = r_risk_free + Insurance_Carrying_Rate + (Auction_Vig / Mean_Hold_Period)' },
        { type: 'heading', text: 'Section 3: The Complete 21 Metric Formal Taxonomy' },
        { type: 'code', text: 'M01: Grade Delta Spread (GDS)          M12: Era-Adjusted Inflation Velocity' },
        { type: 'code', text: 'M02: Relative Scarcity Factor (RSF)       M13: CGC/CBCS Cross-Parity Spread' },
        { type: 'code', text: 'M03: Clearing Velocity Index (CVI)        M14: Creator Death/Revival Alpha' },
        { type: 'code', text: 'M04: Liquidity Discount Carry Cost (LDCC) M15: Media Adaptation Speculation' },
        { type: 'code', text: 'M05: Order Book Depth Ratio (OBDR)        M16: Raw-to-Graded Arbitrage Margin' },
        { type: 'code', text: 'M06: Sovereign Float Capitalization       M17: Slab Turnaround Yield (STY)' },
        { type: 'code', text: 'M07: Provenance Dispersion Score          M18: Auction Vig Friction Ratio' },
        { type: 'code', text: 'M08: Restored/Conserved Discount          M19: Population Deceleration Metric' },
        { type: 'code', text: 'M09: Pedigree Premium Coefficient        M20: Tectonic Regime Vulnerability' },
        { type: 'code', text: 'M10: Defect Sensitivity Curvature        M21: Gregory Sovereign Value Index' },
        { type: 'paragraph', text: 'Metric 21 integrates the entire vector into an authenticated sovereign market clearing expectation, establishing the foundational basis for the CE70 index and Panel Profits equity desks.' },
      ]
    ]
  },
  {
    filePath: 'public/research/white-papers/wp-2026-01.pdf',
    title: 'Market Capitalization Models for Comic Book Equities',
    subtitle: 'Standardized Asset Unit Formulation for Certified Collectibles',
    meta: 'Authors: Devon Knight, Marcus Vance | Date: August 14, 2026 | Ref: PP-WP-2026-001',
    pages: [
      [
        { type: 'title', text: 'Market Capitalization Models for Comic Book Equities' },
        { type: 'subtitle', text: 'Standardized Asset Unit Formulation for Certified Collectibles' },
        { type: 'meta', text: 'Authors: Devon Knight, Marcus Vance | Panel Profits Quantitative Research Group' },
        { type: 'meta', text: 'Publication Date: 2026-08-14 | Reference: PP-WP-2026-001' },
        { type: 'spacer', height: 10 },
        { type: 'heading', text: 'Abstract' },
        { type: 'paragraph', text: 'This white paper introduces a standardized market capitalization methodology for evaluating individual comic book issues as atomic asset units. By aggregating CGC/CBCS census float, realized auction clearing prices, and FMV liquidity spreads, we construct an institutional valuation index for vintage and modern comic holdings.' },
        { type: 'heading', text: '1. Defining Atomic Comic Capitalization' },
        { type: 'paragraph', text: 'Equity market capitalization assumes continuous shares of homogeneous ownership. In contrast, comic capitalizations represent heterogeneous survivor aggregates bounded by survival degradation. We define Total Issue Capitalization (TIC) as the integral of graded census frequency multiplied by sovereign clearing FMV across all verified grades.' },
        { type: 'code', text: 'TIC(Issue) = SUM_{grade=0.5}^{10.0} [ Census(grade) * FMV(grade) ]' },
        { type: 'paragraph', text: 'When unslabbed raw populations are estimated, an empirical Bayesian multiplier theta_raw is applied, establishing the Total Universe Enterprise Float (TUEF).' },
      ],
      [
        { type: 'heading', text: '2. Float Liquidity and Constitutional Index Weighting' },
        { type: 'paragraph', text: 'For the CE70 benchmark, constituent weighting relies strictly on Sovereign Float Capitalization (SFC), discarding untradeable museum holdbacks and unverified private collections. This ensures that market price discovery reflects actionable transactional clearing depth.' },
        { type: 'code', text: 'Weight_CE70(i) = SFC(i) / SUM_{j=1}^{70} [ SFC(j) ]' },
        { type: 'heading', text: '3. Empirical Validation across Golden and Silver Age Blue Chips' },
        { type: 'paragraph', text: 'Empirical testing over 2016-2026 historical records indicates that CE70 constituents display lower annualized downside variance (sigma = 8.4%) relative to speculative raw moderns (sigma = 34.2%).' },
        { type: 'paragraph', text: 'The methodology forms the quantitative backbone of the comicbookstockexchange.com index calculation engine.' },
      ]
    ]
  },
  {
    filePath: 'public/research/white-papers/wp-2026-02.pdf',
    title: 'Variant Ratio Dilution & Secondary Market Floor Resistance',
    subtitle: 'An Empirical Study of Retail Incentive Variants and Capital Erosion',
    meta: 'Authors: Elena Rostova, Claire Holloway | Date: June 22, 2026 | Ref: PP-WP-2026-002',
    pages: [
      [
        { type: 'title', text: 'Variant Ratio Dilution & Secondary Market Floor Resistance' },
        { type: 'subtitle', text: 'Retail Incentive Variant Economics and Capital Depreciation' },
        { type: 'meta', text: 'Authors: Elena Rostova, Claire Holloway | Panel Profits Distribution & Retail Analytics' },
        { type: 'meta', text: 'Publication Date: 2026-06-22 | Reference: PP-WP-2026-002' },
        { type: 'spacer', height: 10 },
        { type: 'heading', text: 'Executive Summary' },
        { type: 'paragraph', text: 'An empirical investigation into retail incentive variants (1:25, 1:50, 1:100) and their long-term impact on primary issue valuations. The study measures distributor Final Order Cutoff (FOC) spikes against secondary market price erosion.' },
        { type: 'heading', text: '1. The Incentive Variant Supply Mechanics' },
        { type: 'paragraph', text: 'Retail incentive covers require direct-market retailers to purchase fixed multiples of standard trade dress covers to unlock higher-tier incentives. This induces artificial inventory accumulation of Cover A units, depressing secondary floor pricing while concentrating short-term capital into artificial ratio scarcity.' },
        { type: 'code', text: 'Floor_Decay_Rate = delta_P(Cover_A) / delta_Q(Incentive_1:100)' },
      ],
      [
        { type: 'heading', text: '2. 18-Month Price Velocity Post-Release' },
        { type: 'paragraph', text: 'Tracking 4,500 incentive variants released between 2021 and 2025 demonstrates that 78.4% of 1:25 and 1:50 variants experience a 60% price decay within 14 months of initial street date.' },
        { type: 'paragraph', text: 'Conversely, true organic key issues (first appearances and creator debuts) retain an 82% floor stability regardless of variant packaging.' },
        { type: 'heading', text: '3. Institutional Guidance' },
        { type: 'paragraph', text: 'Panel Profits risk guidelines stipulate a maximum 5% portfolio allocation to modern variant issues, directing institutional liquidity toward certified blue-chip constitutional equities.' },
      ]
    ]
  },
  {
    filePath: 'public/research/scholarly-papers/sp-2026-01.pdf',
    title: 'Econometric Analysis of IP Adaptations on Blue-Chip Collectibles',
    subtitle: 'The 40-Year Cinematic Speculation Arc in Vintage Comic Equities',
    meta: 'Authors: Dr. Thaddeus Pryor, Sarah Chen | Date: April 10, 2026 | DOI: 10.1016/j.jcae.2026.04.012',
    pages: [
      [
        { type: 'title', text: 'Econometric Analysis of IP Adaptations on Collectibles' },
        { type: 'subtitle', text: 'Evaluating Announcement Arbitrage and Post-Release Contraction' },
        { type: 'meta', text: 'Authors: Dr. Thaddeus Pryor, Sarah Chen | Journal of Cultural Asset Economics' },
        { type: 'meta', text: 'Publication Date: 2026-04-10 | DOI: 10.1016/j.jcae.2026.04.012 | Peer-Reviewed' },
        { type: 'spacer', height: 10 },
        { type: 'heading', text: 'Abstract' },
        { type: 'paragraph', text: 'A scholarly paper analyzing 40 years of comic book market data during major studio film and television announcements. We evaluate the pre-trailer speculative run versus post-release liquidity contraction across 1,200 key issue appearances.' },
        { type: 'heading', text: '1. Methodology & Data Sources' },
        { type: 'paragraph', text: 'We constructed an event-study model around 320 cinematic intellectual property adaptations spanning 1986 to 2026. Transactional evidence was compiled from GPA Analysis, Heritage Auctions, ComicLink, and Panel Profits verified price ledgers.' },
        { type: 'code', text: 'CAR_i(t_1, t_2) = SUM_{t=t_1}^{t_2} [ R_{i,t} - (alpha_i + beta_i * R_{CE70,t}) ]' },
      ],
      [
        { type: 'heading', text: '2. Empirical Findings: The Announcement Spike' },
        { type: 'paragraph', text: 'The announcement of a character entering a cinematic franchise generates a mean Cumulative Abnormal Return (CAR) of +48.6% across the key first appearance within 30 trading days.' },
        { type: 'paragraph', text: 'However, following box office premiere, an average liquidity contraction of -31.2% occurs as speculative holders attempt simultaneous exit into illiquid retail demand.' },
        { type: 'heading', text: '3. Conclusion' },
        { type: 'paragraph', text: 'Long-term terminal value is governed by canonical cultural durability rather than transient media cycles. Blue-chip constitutional assets demonstrate strong resilience, establishing secular value appreciation across multi-decade holding periods.' },
      ]
    ]
  },
  {
    filePath: 'public/research/scholarly-papers/sp-2026-02.pdf',
    title: 'Census Float Dynamics & Slab Scarcity in Post-War Comics',
    subtitle: 'Grading Submission Curves and Price Elasticity in High-Grade Collectibles',
    meta: 'Authors: Jax Mercer, Gideon Vane | Date: January 18, 2026 | DOI: 10.1016/j.jcae.2026.01.005',
    pages: [
      [
        { type: 'title', text: 'Census Float Dynamics & Slab Scarcity in Post-War Comics' },
        { type: 'subtitle', text: 'Statistical Modeling of Census Deceleration and Grade Elasticity' },
        { type: 'meta', text: 'Authors: Jax Mercer, Gideon Vane | International Society for Asset Valuation' },
        { type: 'meta', text: 'Publication Date: 2026-01-18 | DOI: 10.1016/j.jcae.2026.01.005 | Scholarly Paper' },
        { type: 'spacer', height: 10 },
        { type: 'heading', text: 'Abstract' },
        { type: 'paragraph', text: 'This paper examines census population trends for Silver and Bronze Age key issues graded at 9.6 and 9.8. We model the relationship between third-party grading submission rates and realized price spreads in major auction houses.' },
        { type: 'heading', text: '1. The Deceleration Asymptote' },
        { type: 'paragraph', text: 'Analysis of 25 years of CGC and CBCS census data demonstrates that high-grade (9.6+) survivor discovery follows an S-curve asymptote. For pre-1970 issues, new high-grade discoveries have declined by 91% since 2018, establishing extreme supply inelasticity.' },
        { type: 'code', text: 'dCensus_9.8(t) / dt = k * Census_9.8(t) * [ 1 - (Census_9.8(t) / K_max) ]' },
      ],
      [
        { type: 'heading', text: '2. Price Elasticity of Scarcity' },
        { type: 'paragraph', text: 'When the census growth rate approaches zero, the price elasticity of demand increases dramatically. Collectors and sovereign institutions demonstrate willingness to pay exponential premiums for the marginal authenticated copy.' },
        { type: 'paragraph', text: 'We observe a cross-elasticity coefficient of E = 2.45 between census stagnation and realized auction clearing highs.' },
        { type: 'heading', text: '3. Concluding Remarks' },
        { type: 'paragraph', text: 'Post-war key comics in uncirculated state represent one of the most physically constrained collectible asset classes globally, with verifiable census records validating long-term institutional pricing models.' },
      ]
    ]
  }
];

function main() {
  console.log('Generating authentic multi-page research PDFs...');

  for (const paper of PAPERS) {
    const fullPath = path.resolve(__dirname, '..', paper.filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const builder = new SimplePdfBuilder();
    for (const page of paper.pages) {
      builder.addPage(page);
    }

    const pdfBuffer = builder.build();
    fs.writeFileSync(fullPath, pdfBuffer);
    console.log(`Generated: ${paper.filePath} (${pdfBuffer.length} bytes, ${paper.pages.length} pages)`);
  }

  console.log('All 5 research white papers and scholarly papers successfully created.');
}

main();
