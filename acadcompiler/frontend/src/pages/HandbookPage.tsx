import React, { useEffect, useState } from 'react'
import { fetchHandbookStyles, fetchHandbookStyle, downloadHandbookTemplate, downloadHandbookSample } from '../hooks/useApi'
import { IconDownload, IconLink, IconSpinner, IconChevronRight } from '../components/icons'
import type { HandbookStyleSummary, HandbookStyleDetail } from '../types'

// ─── Annotated-paper types ────────────────────────────────────────────────────

type NoteVariant = 'gray' | 'gold' | 'red'
type RowType =
  | 'page-header' | 'separator' | 'hr'
  | 'centered' | 'centered-bold' | 'centered-bold-lg'
  | 'left' | 'left-bold' | 'left-bold-italic' | 'left-italic'
  | 'indent' | 'indent-zero' | 'hanging' | 'block-quote' | 'footnote'

interface PaperRow {
  type: RowType
  content: string
  leftNote?: string
  leftVariant?: NoteVariant
  rightNote?: string
  rightVariant?: NoteVariant
  highlight?: boolean
}
interface PaperSection { id: string; label: string; rows: PaperRow[] }

// ─── Annotated content per style ──────────────────────────────────────────────

const APA7: PaperSection[] = [
  { id: 'title', label: 'Title Page', rows: [
    { type: 'page-header', content: '1',
      rightNote: 'Page numbers: top-right header, starting at 1. Student papers do NOT include a running head.',
      rightVariant: 'gold' },
    { type: 'separator', content: '' },
    { type: 'separator', content: '' },
    { type: 'separator', content: '' },
    { type: 'centered-bold-lg',
      content: 'The Role of Social Media in Adolescent Identity Formation: A Longitudinal Survey Study',
      leftNote: 'Title centered, bold, Title Case. Subtitle after a colon, same line or next. Avoid abbreviations.',
      leftVariant: 'gray',
      rightNote: 'Recommended under 12 words. Descriptive but concise. Do not italicise or underline.',
      rightVariant: 'gold', highlight: true },
    { type: 'separator', content: '' },
    { type: 'separator', content: '' },
    { type: 'centered', content: 'Sarah J. Thompson',
      rightNote: 'Name as on institutional records. No titles (Dr., Prof.) or credentials (PhD).',
      rightVariant: 'gold' },
    { type: 'centered', content: 'Department of Psychology, University of Cambridge',
      leftNote: 'Affiliation: department first, then institution. Separate multiple affiliations with line breaks.',
      leftVariant: 'gray' },
    { type: 'centered', content: 'PSYC 3420: Adolescent Development',
      rightNote: 'Student papers require: course number/name, instructor name, and assignment due date.',
      rightVariant: 'gold' },
    { type: 'centered', content: 'Professor Michael Roberts' },
    { type: 'centered', content: 'November 20, 2025',
      rightNote: 'Full month name, day, year. No ordinals ("20th"). Example: November 20, 2025.',
      rightVariant: 'gold' },
  ]},
  { id: 'body', label: 'Body Text', rows: [
    { type: 'centered-bold', content: 'Abstract',
      rightNote: 'Level 1 heading: centered, bold, Title Case. Body text starts on the next line with a first-line indent.',
      rightVariant: 'gold', highlight: true },
    { type: 'indent-zero',
      content: 'Social media use among adolescents has increased dramatically, yet its relationship with identity development remains poorly understood. This study examined how Instagram and TikTok use affects self-concept clarity and social comparison in 420 high school students (ages 14–18) over a 12-month period. Results indicate that passive consumption negatively predicts identity coherence (β = −0.31, p < .001), while active content creation shows no significant effect. These findings suggest that the nature of social media engagement, rather than frequency alone, is the critical factor in adolescent identity formation.',
      leftNote: 'Abstract: 150–250 words, single paragraph, NO first-line indent. Do not cite sources in the abstract.',
      leftVariant: 'gray',
      rightNote: 'Cover: objective, method, results, and conclusions. Write in past tense for completed work.',
      rightVariant: 'gold' },
    { type: 'left',
      content: 'Keywords: social media, adolescent identity, self-esteem, longitudinal study',
      rightNote: '"Keywords" in italics, then colon. Terms in lowercase (unless proper noun), separated by commas.',
      rightVariant: 'gold', highlight: true },
    { type: 'hr', content: '' },
    { type: 'centered-bold',
      content: 'The Role of Social Media in Adolescent Identity Formation: A Longitudinal Survey Study',
      leftNote: 'Repeat the full title on the first page of body text, centered and bold — exactly as on the title page.',
      leftVariant: 'gray' },
    { type: 'indent',
      content: 'Adolescents today spend an average of 7.5 hours per day engaged with social media platforms, yet the psychological consequences of this exposure remain contested. Erikson\'s (1968) foundational theory of identity development positioned adolescence as a critical period for forming a stable self-concept through exploration and commitment across social roles.',
      leftNote: 'First-line indent: 0.5 in. Double-spaced throughout. NO extra space between paragraphs.',
      leftVariant: 'gray',
      rightNote: 'Author-date citations: (Author, Year). Two authors always listed: (Smith & Jones, 2020). Three or more: (Smith et al., 2020) from first citation.',
      rightVariant: 'gold' },
    { type: 'indent',
      content: 'As Valkenburg and Peter (2011) noted, "the hallmark of social media is that it transforms mass communication into what can best be described as networked self-presentation" (p. 121). This transformation raises fundamental questions about how adolescents construct self-narratives in environments where identity performance is public, persistent, and subject to quantified social feedback.',
      rightNote: 'Short quote (under 40 words): integrate with quotation marks. Page or paragraph number required: (Author, Year, p. XX).',
      rightVariant: 'gold' },
    { type: 'centered-bold', content: 'Literature Review',
      rightNote: 'Level 1: centered, bold, Title Case. Level 2: left-aligned, bold, Title Case. Level 3: left-aligned, bold italic, Title Case.',
      rightVariant: 'gold', highlight: true },
    { type: 'left-bold', content: 'Social Comparison Theory',
      leftNote: 'Level 2 heading: left-aligned, bold, Title Case. No punctuation at end of heading.',
      leftVariant: 'gray' },
    { type: 'indent', content: 'Festinger\'s (1954) social comparison theory proposes that individuals evaluate their opinions and abilities by comparing themselves to others. A comprehensive meta-analysis of 121 studies concluded:' },
    { type: 'block-quote',
      content: 'Exposure to idealized social media portrayals consistently predicts lower body satisfaction and reduced self-esteem among adolescent users, with effect sizes in the moderate range (d = 0.42–0.61). Effects are strongest for girls aged 14–16 and substantially moderated by social comparison orientation. (Vogel et al., 2022, pp. 45–46)',
      leftNote: 'Block quote: 40+ words. Indent 0.5 in from left margin. No quotation marks. Period BEFORE the citation — opposite of regular quotes.',
      leftVariant: 'red',
      rightNote: 'Citation follows closing punctuation: period first, then (Author, Year, pp. XX–XX). No quotation marks.',
      rightVariant: 'gold', highlight: true },
  ]},
  { id: 'references', label: 'References', rows: [
    { type: 'centered-bold', content: 'References',
      leftNote: 'Start "References" on a new page. Heading centered and bold. Two blank lines before first entry.',
      leftVariant: 'gray' },
    { type: 'hanging',
      content: 'Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. Psychological Review, 84(2), 191–215. https://doi.org/10.1037/0033-295X.84.2.191',
      leftNote: 'Alphabetical by first author\'s last name. Hanging indent 0.5 in. Double-spaced throughout.',
      leftVariant: 'gray',
      rightNote: 'Journal: Author, A. A. (Year). Article title in sentence case. Journal Name in Italics, vol(issue), pp–pp. https://doi.org/xxx',
      rightVariant: 'gold', highlight: true },
    { type: 'hanging',
      content: 'Davis, K. (2020). Identity, context, and adolescence in a digital age. In J. Valkenburg & P. Smahel (Eds.), Digital youth: The role of media in development (pp. 34–57). Springer. https://doi.org/10.1007/978-3-030-54564-9_3',
      rightNote: 'Book chapter: Author. (Year). Chapter title. In A. A. Editor (Ed.), Book title (pp. xx–xx). Publisher. DOI.',
      rightVariant: 'gold' },
    { type: 'hanging', content: 'Erikson, E. H. (1968). Identity: Youth and crisis. Norton.',
      leftNote: 'Book: Author. (Year). Title in italics, sentence case. Publisher. No URL for print books without DOI.',
      leftVariant: 'gray' },
    { type: 'hanging',
      content: 'Vogel, E. A., Rose, J. P., Roberts, L. R., & Eckles, K. (2022). Social comparison, social media, and self-evaluation. Psychological Bulletin, 148(4), 1–45. https://doi.org/10.1037/bul0000XXX',
      rightNote: '2–20 authors: list all with "&" before last. For 21+: list first 19, add "…" then last author.',
      rightVariant: 'gold' },
    { type: 'hanging',
      content: 'Valkenburg, P. M., & Peter, J. (2011). Online communication among adolescents. Journal of Adolescent Health, 48(2), 121–127. https://doi.org/10.1016/j.jadohealth.2010.08.020',
      leftNote: 'DOI required for all journal articles where available. Use hyperlink format: https://doi.org/xxx. Remove DOI only if unavailable.',
      leftVariant: 'gray' },
  ]},
]

const IEEE: PaperSection[] = [
  { id: 'title', label: 'Title & Abstract', rows: [
    { type: 'separator', content: '' },
    { type: 'centered-bold-lg',
      content: 'Deep Neural Networks for Real-Time Anomaly Detection in Industrial IoT Sensor Streams',
      leftNote: 'Title: 24pt Times New Roman bold, centered. No separate title page — everything starts on page 1.',
      leftVariant: 'gray',
      rightNote: 'IEEE uses two-column layout. Title, authors, abstract span the full width (both columns) at the top.',
      rightVariant: 'gold', highlight: true },
    { type: 'centered',
      content: 'James O. Hartwell¹, Maria L. Fernández², David K. Okonkwo³',
      rightNote: 'Author names 11pt, "Given Surname" order. Superscript numbers link to affiliations in the footnote area.',
      rightVariant: 'gold' },
    { type: 'centered', content: '¹Dept. Electrical Engineering, MIT, Cambridge, MA, USA',
      leftNote: 'Affiliations: Dept., Institution, City, Country. Listed as footnotes on page 1.',
      leftVariant: 'gray' },
    { type: 'centered', content: '²IRIDIA, Université Libre de Bruxelles, Brussels, Belgium' },
    { type: 'centered', content: '³School of Computer Science, University of Lagos, Lagos, Nigeria' },
    { type: 'separator', content: '' },
    { type: 'left-bold', content: 'Abstract—',
      rightNote: '"Abstract" in bold, em dash, then text immediately on the same line. No new paragraph.',
      rightVariant: 'gold', highlight: true },
    { type: 'left',
      content: 'This paper presents a lightweight transformer architecture for real-time anomaly detection in multivariate industrial IoT sensor data. Our approach achieves 97.3% detection accuracy with 4.2 ms latency on standard embedded hardware, outperforming existing methods by 3× in throughput. We validate on three public benchmarks (SWAT, BATADAL, SKAB) and one proprietary dataset.',
      leftNote: 'Abstract: 150–250 words in a single paragraph. Write in present tense for contributions, past tense for experiments.',
      leftVariant: 'gray' },
    { type: 'left',
      content: 'Index Terms—anomaly detection, deep learning, edge computing, IIoT, transformer networks.',
      rightNote: '"Index Terms" in bold, em dash, then comma-separated lowercase terms. Appears at the END of the abstract block.',
      rightVariant: 'gold', highlight: true },
  ]},
  { id: 'body', label: 'Body Text', rows: [
    { type: 'left-bold', content: 'I. INTRODUCTION',
      rightNote: 'Level 1 (section): Roman numeral + period + ALL CAPS, centered, bold. E.g. "I. INTRODUCTION", "II. RELATED WORK".',
      rightVariant: 'gold', highlight: true },
    { type: 'indent',
      content: 'Industrial IoT (IIoT) systems generate vast quantities of sensor data that must be analysed in real-time. Traditional threshold-based anomaly detection methods fail to capture the complex multivariate correlations present in modern manufacturing systems [1], [2].',
      leftNote: 'Single-spaced. First-line indent ~0.2 in. No blank lines between paragraphs.',
      leftVariant: 'gray',
      rightNote: 'Citations: numeric brackets in order of appearance: [1], [2]. Ranges: [1]–[3]. Multiple separate: [1], [3], [5].',
      rightVariant: 'gold' },
    { type: 'indent',
      content: 'Recent advances in self-supervised learning have demonstrated that transformer architectures can model temporal dependencies in time-series without requiring labelled anomaly examples [3]–[5]. However, these models remain computationally expensive for resource-constrained edge devices.',
      leftNote: 'Do NOT write "our previous work [3]" — IEEE papers are double-blind. Write "as shown in [3]" only in the camera-ready version.',
      leftVariant: 'red' },
    { type: 'left-bold', content: 'II. RELATED WORK' },
    { type: 'left-bold-italic', content: 'A. Statistical Methods',
      leftNote: 'Level 2 (subsection): capital letter + period, italic title case. E.g. "A. Subsection Name". Left-aligned.',
      leftVariant: 'gray', highlight: true },
    { type: 'indent', content: 'Early anomaly detection relied on SPC techniques such as CUSUM [6] and Shewhart control charts [7]. These assume Gaussian-distributed readings and fail under non-stationary drift common in aging equipment.' },
    { type: 'left-bold-italic', content: 'B. Deep Learning Approaches' },
    { type: 'indent',
      content: 'Convolutional autoencoders [8] and LSTM-based models [9], [10] have shown strong benchmark performance. Transformer-based models [11] can capture long-range dependencies that recurrent networks struggle with.',
      rightNote: 'Equations are numbered right-aligned in parentheses: (1), (2). Refer to them as "equation (1)". Figures: "Fig. 1", Tables: "Table I" (Roman numerals).',
      rightVariant: 'gold' },
    { type: 'left-bold', content: 'III. PROPOSED METHOD' },
    { type: 'left-bold-italic', content: 'A. Architecture' },
    { type: 'indent',
      content: 'Fig. 1 shows the proposed architecture comprising: (1) a temporal patch embedding module, (2) a sparse self-attention encoder, and (3) a reconstruction-based anomaly scoring head. Input windows span T = 60 timesteps across D = 25 sensor channels.',
      leftNote: 'Use "Fig." (not "Figure") in text. Use "Table I" with Roman numerals. Figure captions go BELOW figures; table captions go ABOVE tables.',
      leftVariant: 'gray' },
  ]},
  { id: 'references', label: 'References', rows: [
    { type: 'left-bold', content: 'REFERENCES',
      leftNote: '"REFERENCES" heading: centered, ALL CAPS, no section number. Not "Bibliography". Appears at the end of the paper.',
      leftVariant: 'gray' },
    { type: 'hanging',
      content: '[1] G. Pang, C. Shen, L. Cao, and A. van den Hengel, "Deep learning for anomaly detection: A review," ACM Comput. Surv., vol. 54, no. 2, pp. 1–38, Mar. 2021.',
      leftNote: 'Order of appearance, NOT alphabetical. Format: [N] I. Surname, "Title," Abbrev. Journal, vol. X, no. Y, pp. ZZ–ZZ, Mon. YYYY.',
      leftVariant: 'gray',
      rightNote: 'Journal names must use official IEEE/NLM abbreviations. Months abbreviated to 3 letters: Jan., Feb., Mar., …',
      rightVariant: 'gold', highlight: true },
    { type: 'hanging',
      content: '[2] M. Goldstein and S. Uchida, "A comparative evaluation of unsupervised anomaly detection algorithms," PLoS ONE, vol. 11, no. 4, Apr. 2016, Art. no. e0152173.' },
    { type: 'hanging',
      content: '[3] A. Vaswani et al., "Attention is all you need," in Proc. Adv. Neural Inf. Process. Syst. (NeurIPS), Long Beach, CA, USA, Dec. 2017, pp. 5998–6008.',
      leftNote: 'Conference: "in Proc. Full Name (Abbrev.), City, Country, Mon. YYYY, pp. XX–XX". For 6+ authors: list up to 6 then "et al."',
      leftVariant: 'gray',
      rightNote: 'DOI format for IEEE papers: doi: 10.1109/XXX. Include for all papers where available.',
      rightVariant: 'gold' },
    { type: 'hanging',
      content: '[4] J. O. Hartwell, M. L. Fernández, and D. K. Okonkwo, "Sparse transformers for edge IoT anomaly detection," IEEE Trans. Ind. Electron., early access, Jan. 2025, doi: 10.1109/TIE.2025.XXXXXXX.',
      rightNote: 'Online-first / early access: include "early access, Mon. YYYY, doi: XX.XXXX/XXX" instead of volume/page numbers.',
      rightVariant: 'gold' },
  ]},
]

const OSCOLA: PaperSection[] = [
  { id: 'body', label: 'Body & Footnotes', rows: [
    { type: 'left-bold', content: 'I. Liability of AI Systems Under the Tort of Negligence',
      rightNote: 'OSCOLA prescribes no heading format. Follow your institution\'s guide. Common: numbered, left-aligned, bold.',
      rightVariant: 'gold' },
    { type: 'indent',
      content: 'The deployment of autonomous decision-making systems raises fundamental questions about the allocation of liability under English tort law.¹ The traditional negligence framework, as articulated in Donoghue v Stevenson,² requires the claimant to establish a duty of care, breach of that duty, and consequent damage.',
      leftNote: 'OSCOLA uses footnote citations — the body text contains only superscript numbers, NOT parenthetical references.',
      leftVariant: 'gray',
      rightNote: 'Superscript numbers appear after punctuation (except the dash). Number consecutively throughout. No "ibid" — use short forms.',
      rightVariant: 'gold', highlight: true },
    { type: 'indent',
      content: 'Whether an AI system can owe or breach a duty of care remains contested.³ Some scholars argue existing frameworks are adequate if liability is attributed to the developer;⁴ others contend the unpredictability of ML systems undermines the Caparo test.⁵' },
    { type: 'hr', content: '' },
    { type: 'footnote', content: '¹ See generally Tom Allen, "The Liability of AI Systems in English Law" (2023) 43 LS 112.',
      leftNote: 'Journal article: Author, "Title" (Year) Volume Abbreviation FirstPage. No comma before year in round brackets.',
      leftVariant: 'gray',
      rightNote: 'Footnotes: 10pt, single-spaced. First citation: full form. Subsequent: Author (n X) pinpoint.',
      rightVariant: 'gold', highlight: true },
    { type: 'footnote', content: '² [1932] AC 562 (HL).',
      rightNote: 'Cases: Party v Party [Year] Volume Reporter Page (Court). Square brackets when year identifies the volume; round brackets otherwise.',
      rightVariant: 'gold' },
    { type: 'footnote', content: '³ Strahilevitz (n 1) 118.',
      leftNote: 'Short form for subsequent references: Surname (n X) page — where X is the footnote number of the FIRST citation.',
      leftVariant: 'red', highlight: true },
    { type: 'footnote', content: '⁴ Richard Susskind and Daniel Susskind, The Future of the Professions (OUP 2015) 143.',
      rightNote: 'Books: Author, Title in Italics (Publisher Year) page. No comma between publisher and year inside parentheses.',
      rightVariant: 'gold' },
    { type: 'footnote', content: '⁵ Allen (n 1) 118.' },
  ]},
  { id: 'references', label: 'Bibliography', rows: [
    { type: 'centered-bold', content: 'Bibliography',
      leftNote: 'OSCOLA bibliography: divided into Cases, Legislation, Secondary Sources. Within each section: alphabetical order.',
      leftVariant: 'gray' },
    { type: 'left-bold', content: 'Cases',
      rightNote: 'Cases in bibliography: no full stop at end. Party v Party [Year] Volume Reporter (Court).',
      rightVariant: 'gold' },
    { type: 'hanging', content: 'Caparo Industries plc v Dickman [1990] 2 AC 605 (HL)' },
    { type: 'hanging', content: 'Donoghue v Stevenson [1932] AC 562 (HL)' },
    { type: 'left-bold', content: 'Legislation',
      rightNote: 'Acts: Short Title Year in italics, then specific provision (s 1(2)(a)). No full stop at end.',
      rightVariant: 'gold' },
    { type: 'hanging', content: 'Automated and Electric Vehicles Act 2018',
      leftNote: 'Legislation in bibliography: italicised short title and year. No chapter number needed.',
      leftVariant: 'gray' },
    { type: 'hanging', content: 'Consumer Rights Act 2015' },
    { type: 'left-bold', content: 'Secondary Sources' },
    { type: 'hanging',
      content: 'Allen T, "The Liability of AI Systems in English Law" (2023) 43 LS 112',
      leftNote: 'Journal articles: Surname Initial(s), "Title" (Year) Volume Abbreviation FirstPage. Note: no comma after author initials.',
      leftVariant: 'gray',
      rightNote: 'Book chapters: Surname Initial(s), "Chapter Title" in Editor Initial(s) Surname (ed), Book Title (Publisher Year) page.',
      rightVariant: 'gold', highlight: true },
    { type: 'hanging',
      content: 'Susskind R and Susskind D, The Future of the Professions (OUP 2015)',
      rightNote: 'Books: Surname Initial(s), Title in Italics (Publisher Year). No page numbers in bibliography.',
      rightVariant: 'gold' },
  ]},
]

const STYLE_SECTIONS: Record<string, PaperSection[]> = {
  apa7: APA7,
  ieee: IEEE,
  oscola: OSCOLA,
}

// ─── Quick-reference grid data ────────────────────────────────────────────────

interface QRField { label: string; value: string }
interface QRGroup { heading: string; fields: QRField[] }

function getQuickRef(style: HandbookStyleDetail): QRGroup[] {
  const n = style.notes
  const groups: QRGroup[] = []
  const fmt: QRField[] = []
  if (n.page_setup) fmt.push({ label: 'Page setup', value: n.page_setup })
  if (n.font) fmt.push({ label: 'Font', value: n.font })
  if (n.spacing) fmt.push({ label: 'Spacing', value: n.spacing })
  if (n.headings) fmt.push({ label: 'Headings', value: n.headings })
  if (n.title_page) fmt.push({ label: 'Title page', value: n.title_page })
  if (n.abstract) fmt.push({ label: 'Abstract', value: n.abstract })
  if (n.figures) fmt.push({ label: 'Figures & tables', value: n.figures })
  if (fmt.length) groups.push({ heading: 'Formatting', fields: fmt })

  const cite: QRField[] = []
  if (n.citations) cite.push({ label: 'In-text citations', value: n.citations })
  if (n.references) cite.push({ label: 'Reference list', value: n.references })
  if ((n as any).footnotes) cite.push({ label: 'Footnotes', value: (n as any).footnotes })
  if (n.cases) cite.push({ label: 'Cases', value: n.cases })
  if (n.legislation) cite.push({ label: 'Legislation', value: n.legislation })
  if (n.secondary) cite.push({ label: 'Books & articles', value: n.secondary })
  if (cite.length) groups.push({ heading: 'Citations & References', fields: cite })

  return groups
}

// ─── Render helpers ───────────────────────────────────────────────────────────

const ANN: Record<NoteVariant, React.CSSProperties> = {
  gray: { background: '#e8e8e8', border: '1px solid #c0c0c0', color: '#333' },
  gold: { background: '#f5f0d0', border: '1px solid #c8b860', color: '#3d2e00' },
  red:  { background: '#fde8e8', border: '1px solid #f0a0a0', color: '#7a0000' },
}

function Ann({ note, variant, side }: { note: string; variant: NoteVariant; side: 'left' | 'right' }) {
  return (
    <div style={{
      ...ANN[variant],
      fontSize: 10.5, lineHeight: 1.5, padding: '7px 9px', borderRadius: 4,
      position: 'relative', alignSelf: 'start',
    }}>
      {/* arrow pointing toward paper */}
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [side === 'left' ? 'right' : 'left']: -8,
        width: 0, height: 0,
        borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
        [side === 'left' ? 'borderLeft' : 'borderRight']: `8px solid ${variant === 'gold' ? '#c8b860' : variant === 'red' ? '#f0a0a0' : '#c0c0c0'}`,
      }}/>
      {note}
    </div>
  )
}

function paperElStyle(type: RowType, idx: number, total: number, highlight?: boolean): React.CSSProperties {
  const isFirst = idx === 0
  const isLast = idx === total - 1
  const base: React.CSSProperties = {
    background: highlight ? '#fffde7' : 'white',
    paddingLeft: 48, paddingRight: 48,
    paddingTop: isFirst ? 36 : (type === 'separator' ? 0 : type === 'hr' ? 8 : 2),
    paddingBottom: isLast ? 36 : (type === 'separator' ? 8 : type === 'hr' ? 8 : 2),
    borderLeft: '1px solid #d0d0d0', borderRight: '1px solid #d0d0d0',
    fontFamily: '"Times New Roman", Times, serif',
    color: '#1a1a1a',
  }
  if (isFirst) { base.borderTop = '1px solid #d0d0d0'; base.borderTopLeftRadius = 3; base.borderTopRightRadius = 3 }
  if (isLast) { base.borderBottom = '1px solid #d0d0d0'; base.borderBottomLeftRadius = 3; base.borderBottomRightRadius = 3 }
  return base
}

function PaperEl({ row, idx, total }: { row: PaperRow; idx: number; total: number }) {
  const s = paperElStyle(row.type, idx, total, row.highlight)
  const t = row.type

  if (t === 'separator') return <div style={{ ...s, minHeight: 14 }}/>
  if (t === 'hr') return <div style={s}><hr style={{ margin: '4px 0', borderColor: '#999', borderTopWidth: 1 }}/></div>
  if (t === 'page-header') return (
    <div style={{ ...s, fontSize: 11, textAlign: 'right', paddingTop: 8, paddingBottom: 4 }}>{row.content}</div>
  )
  if (t === 'centered-bold-lg') return (
    <div style={{ ...s, fontSize: 14, fontWeight: 700, textAlign: 'center', lineHeight: 1.5, paddingTop: 8, paddingBottom: 8 }}>{row.content}</div>
  )
  if (t === 'centered-bold') return (
    <div style={{ ...s, fontSize: 12, fontWeight: 700, textAlign: 'center', paddingTop: 10, paddingBottom: 4 }}>{row.content}</div>
  )
  if (t === 'centered') return (
    <div style={{ ...s, fontSize: 12, textAlign: 'center', paddingTop: 1, paddingBottom: 1 }}>{row.content}</div>
  )
  if (t === 'left-bold') return (
    <div style={{ ...s, fontSize: 12, fontWeight: 700, paddingTop: 8, paddingBottom: 2 }}>{row.content}</div>
  )
  if (t === 'left-bold-italic') return (
    <div style={{ ...s, fontSize: 12, fontWeight: 700, fontStyle: 'italic', paddingTop: 6, paddingBottom: 2 }}>{row.content}</div>
  )
  if (t === 'left-italic') return (
    <div style={{ ...s, fontSize: 12, fontStyle: 'italic', paddingTop: 2, paddingBottom: 2 }}>{row.content}</div>
  )
  if (t === 'left') return (
    <div style={{ ...s, fontSize: 12, lineHeight: 1.8, paddingTop: 2, paddingBottom: 2 }}>{row.content}</div>
  )
  if (t === 'indent') return (
    <div style={{ ...s, fontSize: 12, lineHeight: 1.8, textIndent: 32, paddingTop: 2, paddingBottom: 2 }}>{row.content}</div>
  )
  if (t === 'indent-zero') return (
    <div style={{ ...s, fontSize: 12, lineHeight: 1.8, paddingTop: 2, paddingBottom: 2 }}>{row.content}</div>
  )
  if (t === 'hanging') return (
    <div style={{ ...s, fontSize: 12, lineHeight: 1.8, paddingLeft: 80, textIndent: -32, paddingTop: 2, paddingBottom: 2 }}>{row.content}</div>
  )
  if (t === 'block-quote') return (
    <div style={{ ...s, fontSize: 12, lineHeight: 1.8, paddingLeft: 80, paddingRight: 80, paddingTop: 6, paddingBottom: 6, color: '#333' }}>{row.content}</div>
  )
  if (t === 'footnote') return (
    <div style={{ ...s, fontSize: 10, lineHeight: 1.6, paddingLeft: 48, paddingTop: 2, paddingBottom: 2, color: '#333' }}>{row.content}</div>
  )
  return <div style={s}>{row.content}</div>
}

// ─── Annotated paper view ─────────────────────────────────────────────────────

function AnnotatedPaper({ rows }: { rows: PaperRow[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr 160px',
      columnGap: 14,
      rowGap: 0,
      alignItems: 'center',
    }}>
      {rows.map((row, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {row.leftNote && <Ann note={row.leftNote} variant={row.leftVariant || 'gray'} side="left"/>}
          </div>
          <PaperEl row={row} idx={i} total={rows.length}/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            {row.rightNote && <Ann note={row.rightNote} variant={row.rightVariant || 'gold'} side="right"/>}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Quick reference view ─────────────────────────────────────────────────────

function QuickRef({ style }: { style: HandbookStyleDetail }) {
  const groups = getQuickRef(style)
  return (
    <div>
      {groups.map(g => (
        <div key={g.heading} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: style.color, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${style.color}30` }}>
            {g.heading}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
            {g.fields.map(f => (
              <div key={f.label} style={{ marginBottom: 14, borderBottom: '1px solid var(--c-border-soft)', paddingBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-text-muted)', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', lineHeight: 1.65 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {style.notes.common_mistakes && style.notes.common_mistakes.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--c-red)', marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--c-red-dim)' }}>
            Common Mistakes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {style.notes.common_mistakes.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 13px', background: 'var(--c-red-soft)', border: '1px solid var(--c-red-dim)', borderLeft: '3px solid var(--c-red)', borderRadius: 6, fontSize: 12.5, color: 'var(--c-text-2)' }}>
                <span style={{ color: 'var(--c-red)', fontWeight: 700, flexShrink: 0 }}>✗</span>
                {m}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sample download card ─────────────────────────────────────────────────────

function SampleCard({ styleId, sample, color }: { styleId: string; sample: any; color: string }) {
  const [loading, setLoading] = useState(false)
  async function handleDownload() {
    setLoading(true)
    try {
      const blob = await downloadHandbookSample(styleId, sample.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = sample.filename; a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) { alert('Download failed: ' + e.message) }
    finally { setLoading(false) }
  }
  return (
    <div style={{ border: '1px solid var(--c-border)', borderRadius: 8, padding: '12px 14px', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 40, borderRadius: 3, flexShrink: 0, background: `${color}15`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
            <rect x="1" y="1" width="12" height="16" rx="1.5" stroke={color} strokeWidth="1.3"/>
            <path d="M3 6h8M3 9h8M3 12h5" stroke={color} strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)', lineHeight: 1.4, marginBottom: 2 }}>{sample.title}</div>
          <div style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.4 }}>{sample.description}</div>
        </div>
      </div>
      <button onClick={handleDownload} disabled={loading} className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>
        {loading ? <><IconSpinner size={12}/> Downloading…</> : <><IconDownload size={12}/> Download .docx</>}
      </button>
    </div>
  )
}

// ─── Style detail panel ───────────────────────────────────────────────────────

function StyleDetail({ style }: { style: HandbookStyleDetail }) {
  const sections = STYLE_SECTIONS[style.id] || []
  const [activeSection, setActiveSection] = useState(sections[0]?.id || 'quick')
  const [dlLoading, setDlLoading] = useState(false)

  const allTabs = [
    ...sections.map(s => ({ id: s.id, label: s.label })),
    { id: 'quick', label: 'Quick Reference' },
  ]
  const currentSection = sections.find(s => s.id === activeSection)

  async function handleTemplateDownload() {
    if (style.template_source === 'internet') { window.open(style.template_url, '_blank'); return }
    setDlLoading(true)
    try {
      const blob = await downloadHandbookTemplate(style.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = style.template_file || `${style.id}_template`; a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) { alert('Download failed: ' + e.message) }
    finally { setDlLoading(false) }
  }

  return (
    <div>
      {/* Style header */}
      <div style={{
        borderRadius: 10, padding: '16px 20px', marginBottom: 18,
        background: `linear-gradient(135deg, ${style.color}12 0%, ${style.color}05 100%)`,
        border: `1px solid ${style.color}28`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: style.color }}/>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>{style.name}</h2>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: style.template_source === 'uploaded' ? '#d1fae5' : '#e0e7ff', color: style.template_source === 'uploaded' ? '#065f46' : '#3730a3', border: `1px solid ${style.template_source === 'uploaded' ? '#a7f3d0' : '#c7d2fe'}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {style.template_source === 'uploaded' ? 'Official template' : 'Internet source'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 6 }}>{style.full_name}</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--c-text-2)' }}>
            <span><strong>Authority:</strong> {style.authority}</span>
            <span><strong>Edition:</strong> {style.edition}</span>
            <span><strong>Disciplines:</strong> {style.discipline}</span>
          </div>
        </div>
        <button onClick={handleTemplateDownload} disabled={dlLoading} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
          {dlLoading ? <><IconSpinner size={12}/> Downloading…</>
            : style.template_source === 'internet' ? <><IconLink size={12}/> View official template</>
            : <><IconDownload size={12}/> Download official template</>}
        </button>
      </div>

      {/* Legend row */}
      {sections.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 11, color: 'var(--c-text-muted)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600 }}>Annotation key:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 24, height: 14, background: '#e8e8e8', border: '1px solid #c0c0c0', borderRadius: 2 }}/>
            Gray — what to write
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 24, height: 14, background: '#f5f0d0', border: '1px solid #c8b860', borderRadius: 2 }}/>
            Gold — style rules
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 24, height: 14, background: '#fde8e8', border: '1px solid #f0a0a0', borderRadius: 2 }}/>
            Red — common mistake
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 24, height: 14, background: '#fffde7', border: '1px solid #e8e0a0', borderRadius: 2 }}/>
            Highlighted row — key element
          </span>
        </div>
      )}

      {/* Section tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--c-border)', marginBottom: 20, gap: 0 }}>
        {allTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)} style={{
            padding: '9px 16px', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
            background: activeSection === tab.id ? 'var(--c-bg)' : 'transparent',
            color: activeSection === tab.id ? style.color : 'var(--c-text-muted)',
            borderBottom: activeSection === tab.id ? `2px solid ${style.color}` : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeSection === 'quick' && <QuickRef style={style}/>}
      {currentSection && activeSection !== 'quick' && (
        <AnnotatedPaper rows={currentSection.rows}/>
      )}

      {/* Sample papers */}
      {style.samples && style.samples.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            Sample papers
            <span style={{ fontSize: 10, background: `${style.color}15`, color: style.color, padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{style.samples.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {style.samples.map(sample => (
              <SampleCard key={sample.id} styleId={style.id} sample={sample} color={style.color}/>
            ))}
          </div>
        </div>
      )}

      {!style.samples && (
        <div style={{ marginTop: 20, border: '1px dashed var(--c-border)', borderRadius: 8, padding: '16px 20px', textAlign: 'center', color: 'var(--c-text-muted)', fontSize: 12 }}>
          No sample papers included for this style. The official template link above contains annotated examples.
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function HandbookPage() {
  const [styles, setStyles] = useState<HandbookStyleSummary[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [detail, setDetail] = useState<HandbookStyleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHandbookStyles()
      .then(data => { setStyles(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!selected) return
    setDetailLoading(true); setDetail(null)
    fetchHandbookStyle(selected)
      .then(d => { setDetail(d); setDetailLoading(false) })
      .catch(e => { setError(e.message); setDetailLoading(false) })
  }, [selected])

  const filtered = styles.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.authority.toLowerCase().includes(search.toLowerCase()) ||
    s.discipline.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '28px 28px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: 'var(--c-text)' }}>Style Handbook</h1>
        <p style={{ fontSize: 12.5, color: 'var(--c-text-muted)', margin: '4px 0 0' }}>
          Annotated sample papers, official templates, and quick-reference rules for {styles.length} citation styles
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '272px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Style list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 20 }}>
          <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid var(--c-border)' }}>
            <input className="input" placeholder="Search styles…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ width: '100%', fontSize: 12 }}/>
          </div>
          {loading && <div style={{ padding: 20, textAlign: 'center' }}><IconSpinner size={18}/></div>}
          {!loading && (
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
              {filtered.map(s => (
                <button key={s.id} onClick={() => setSelected(s.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'stretch',
                  background: selected === s.id ? `${s.color}08` : 'transparent',
                  border: 'none', borderBottom: '1px solid var(--c-border-soft)',
                  cursor: 'pointer', padding: 0, textAlign: 'left',
                  outline: selected === s.id ? `1.5px solid ${s.color}40` : 'none',
                }}>
                  <div style={{ width: 4, background: s.color, flexShrink: 0 }}/>
                  <div style={{ padding: '10px 11px', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: selected === s.id ? s.color : 'var(--c-text)', lineHeight: 1.3 }}>{s.name}</span>
                      {s.has_samples && <span style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 9, background: `${s.color}15`, color: s.color, fontWeight: 600, flexShrink: 0 }}>{s.sample_count}</span>}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--c-text-muted)', marginTop: 2 }}>{s.authority}</div>
                    <div style={{ fontSize: 10, color: 'var(--c-text-muted)', marginTop: 3, opacity: 0.7 }}>{s.discipline.split(',')[0]}{s.discipline.includes(',') ? '…' : ''}</div>
                    <div style={{ display: 'flex', gap: 3, marginTop: 5, flexWrap: 'wrap' }}>
                      {s.has_template_file && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 7, background: '#d1fae5', color: '#065f46', fontWeight: 600, letterSpacing: '0.03em' }}>TEMPLATE</span>}
                      {s.has_samples && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 7, background: '#dbeafe', color: '#1e40af', fontWeight: 600, letterSpacing: '0.03em' }}>SAMPLES</span>}
                      {STYLE_SECTIONS[s.id] && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 7, background: '#fef9c3', color: '#854d0e', fontWeight: 600, letterSpacing: '0.03em' }}>ANNOTATED</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: 8, color: 'var(--c-text-muted)' }}>
                    <IconChevronRight size={11}/>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div>
          {!selected && !loading && (
            <div style={{ border: '1.5px dashed var(--c-border)', borderRadius: 10, padding: '56px 36px', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.22, margin: '0 auto 14px', display: 'block' }}>
                <rect x="6" y="4" width="28" height="38" rx="3" stroke="var(--c-text)" strokeWidth="2.5"/>
                <path d="M12 14h16M12 20h16M12 26h10" stroke="var(--c-text)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M34 10v34l8-6V4l-8 6z" stroke="var(--c-text)" strokeWidth="2.2" strokeLinejoin="round"/>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', marginBottom: 6 }}>Select a citation style</div>
              <div style={{ fontSize: 12.5, color: 'var(--c-text-muted)' }}>
                APA 7, IEEE, and OSCOLA include fully annotated sample papers<br/>— rules appear inline next to each document element.
              </div>
            </div>
          )}
          {detailLoading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-text-muted)' }}><IconSpinner size={22}/></div>}
          {error && <div style={{ background: 'var(--c-red-soft)', border: '1px solid var(--c-red-dim)', borderRadius: 8, padding: 14, fontSize: 13, color: 'var(--c-red)' }}>{error}</div>}
          {detail && !detailLoading && <StyleDetail style={detail}/>}
        </div>
      </div>
    </div>
  )
}
