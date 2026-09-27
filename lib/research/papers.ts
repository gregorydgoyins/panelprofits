export interface ResearchPaper {
  id: string;
  title: string;
  category: "white-paper" | "scholarly-paper";
  authors: string[];
  publicationDate: string;
  institution: string;
  abstract: string;
  downloadUrl: string;
  doiOrRef: string;
}

export const RESEARCH_PAPERS_REGISTRY: ResearchPaper[] = [
  {
    id: "wp-2026-01",
    title: "Market Capitalization Models for Atomic Asset Classes in Comic Book Equities",
    category: "white-paper",
    authors: ["Devon Knight", "Marcus Vance"],
    publicationDate: "2026-08-14",
    institution: "Panel Profits Quantitative Research Group",
    abstract: "This white paper introduces a standardized market capitalization methodology for evaluating individual comic book issues as atomic asset units. By aggregating CGC/CBCS census float, realized auction clearing prices, and FMV liquidity spreads, we construct an institutional valuation index for vintage and modern comic holdings.",
    downloadUrl: "/research/white-papers/wp-2026-01.pdf",
    doiOrRef: "PP-WP-2026-001"
  },
  {
    id: "wp-2026-02",
    title: "Variant Ratio Dilution & Secondary Market Floor Resistance",
    category: "white-paper",
    authors: ["Elena Rostova", "Claire Holloway"],
    publicationDate: "2026-06-22",
    institution: "Panel Profits Distribution & Retail Analytics",
    abstract: "An empirical investigation into retail incentive variants (1:25, 1:50, 1:100) and their long-term impact on primary issue valuations. The study measures distributor Final Order Cutoff (FOC) spikes against secondary market price erosion.",
    downloadUrl: "/research/white-papers/wp-2026-02.pdf",
    doiOrRef: "PP-WP-2026-002"
  },
  {
    id: "sp-2026-01",
    title: "Econometric Analysis of Intellectual Property Adaptations on Blue-Chip Collectibles",
    category: "scholarly-paper",
    authors: ["Dr. Thaddeus Pryor", "Sarah Chen"],
    publicationDate: "2026-04-10",
    institution: "Journal of Cultural Asset Economics & Panel Profits",
    abstract: "A scholarly paper analyzing 40 years of comic book market data during major studio film and television announcements. We evaluate the pre-trailer speculative run versus post-release liquidity contraction across 1,200 key issue appearances.",
    downloadUrl: "/research/scholarly-papers/sp-2026-01.pdf",
    doiOrRef: "DOI:10.1016/j.jcae.2026.04.012"
  },
  {
    id: "sp-2026-02",
    title: "Census Float Dynamics & High-Grade Slab Scarcity in Post-War Comics",
    category: "scholarly-paper",
    authors: ["Jax Mercer", "Gideon Vane"],
    publicationDate: "2026-01-18",
    institution: "International Society for Asset Valuation",
    abstract: "This paper examines census population trends for Silver and Bronze Age key issues graded at 9.6 and 9.8. We model the relationship between third-party grading submission rates and realized price spreads in major auction houses.",
    downloadUrl: "/research/scholarly-papers/sp-2026-02.pdf",
    doiOrRef: "DOI:10.1016/j.jcae.2026.01.005"
  }
];
