"""Handbook/Guide router — style templates, notes, and sample papers."""
from __future__ import annotations
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

_OFFICIAL_DIR = Path(__file__).parent.parent.parent.parent / "templates" / "official"
_SAMPLES_DIR  = Path(__file__).parent.parent.parent.parent / "templates" / "samples"

CATALOG = [
    {
        "id": "apa7",
        "name": "APA 7th Edition",
        "full_name": "Publication Manual of the American Psychological Association (7th ed.)",
        "authority": "American Psychological Association",
        "edition": "7th (2020)",
        "discipline": "Psychology, Social Sciences, Education, Nursing, Business",
        "template_source": "internet",
        "template_url": "https://apastyle.apa.org/style-grammar-guidelines/paper-format/student-paper",
        "color": "#4f46e5",
        "notes": {
            "overview": "APA 7th edition is the dominant citation style in the social sciences. The 7th edition (2020) made several major changes: running head no longer required for student papers, singular 'they' endorsed, up to 20 authors listed in references (previously 7), and new bias-free language guidance.",
            "page_setup": "1-inch margins on all sides. 8.5 × 11 inch (US Letter) paper.",
            "font": "Times New Roman 12pt (most common), Calibri 11pt, Arial 11pt, Lucida Sans Unicode 10pt, or Georgia 11pt. Use one font throughout.",
            "spacing": "Double-spaced throughout — body, abstract, references, block quotes, title page. No extra space between paragraphs. First line indent 0.5 in.",
            "title_page": "Student papers: title (bold, centred), author name, institutional affiliation, course number/name, instructor name, assignment due date. Professional papers add running head and author note.",
            "headings": "Level 1: centred bold title case. Level 2: left-aligned bold title case. Level 3: left-aligned bold italic title case. Level 4: indented bold title case, ends with period. Level 5: indented bold italic title case, ends with period.",
            "citations": "Author–date: (Smith, 2020) or Smith (2020). Two authors: (Smith & Jones, 2020). Three or more: (Smith et al., 2020). Same year: (Smith, 2020a, 2020b). Page number: (Smith, 2020, p. 45).",
            "references": "Hanging indent 0.5 in, alphabetical. DOI required where available. Journal: Author, A. A. (Year). Title. Journal Name, volume(issue), pp–pp. https://doi.org/xxxxx",
            "common_mistakes": [
                "Adding running head to student papers (not required in 7th ed.)",
                "Using '&' in narrative citations — 'Smith and Jones (2020)' in text, '&' only in parentheses",
                "Forgetting to double-space the reference list",
                "Missing DOIs on post-2000 journal articles",
                "Wrong heading level order — must use levels sequentially",
                "Omitting bold on 'References' heading",
            ],
            "key_changes_from_6th": [
                "Running head removed for student papers",
                "One space after full stop (period) now preferred",
                "Singular 'they' endorsed as gender-neutral pronoun",
                "Up to 20 authors listed in references (was 7)",
                "New inclusive language guidance (disability, race, age, gender)",
            ],
        },
        "samples": [
            {
                "id": "apa7_sample_01",
                "title": "The Role of Social Media in Adolescent Identity Formation",
                "description": "Psychology — title page, abstract, literature review, methods, discussion, references",
                "filename": "apa7_sample_01.docx",
            },
            {
                "id": "apa7_sample_02",
                "title": "Mindfulness-Based Interventions and Academic Performance: A Meta-Analysis",
                "description": "Educational psychology — systematic review with meta-analytic statistics, effect sizes",
                "filename": "apa7_sample_02.docx",
            },
        ],
    },
    {
        "id": "ieee",
        "name": "IEEE Conference Paper",
        "full_name": "IEEE Author Center — Conference Paper Template",
        "authority": "Institute of Electrical and Electronics Engineers",
        "edition": "Current (2024)",
        "discipline": "Electrical Engineering, Computer Science, Electronics, Telecommunications",
        "template_source": "uploaded",
        "template_file": "ieee_template.doc",
        "color": "#0369a1",
        "notes": {
            "overview": "The IEEE conference paper format is the standard for IEEE-sponsored conferences worldwide. It uses a two-column layout, 10pt Times New Roman, numeric bracketed citations, and condensed typography designed for maximum information density within a strict page limit (typically 6–8 pages).",
            "page_setup": "A4 or US Letter. Margins: top 0.75 in, bottom 1 in, left/right 0.625 in. Two-column layout with 0.25 in column gap.",
            "font": "Times New Roman throughout. Title: 24pt bold. Author names: 11pt. Section headings: 10pt bold CAPS. Body: 10pt. Footnotes/captions: 8pt.",
            "spacing": "Single-spaced. No blank lines between paragraphs. First-line indent ~0.2 in.",
            "title_page": "No separate title page. Title, authors, affiliations, and abstract all on page 1. Author affiliations as footnotes on page 1.",
            "headings": "Level 1 (Roman): I. INTRODUCTION — centred, CAPS, bold. Level 2 (letter): A. Subsection — left-aligned, italic title case. Level 3: 1) Sub-subsection — run into paragraph text.",
            "citations": "Numeric brackets in order of appearance: [1], [2], [3]–[5]. 'as shown in [3]' — do not write 'as shown in [our previous work, 3]'.",
            "references": "Numbered, order of appearance. Journal: A. B. Author, \"Title,\" Journal Abbrev., vol. X, no. Y, pp. ZZ–ZZ, Mon. Year. Conference: A. B. Author, \"Title,\" in Proc. Conf. Name, City, Year, pp. ZZ–ZZ.",
            "common_mistakes": [
                "Single-column layout — must be two-column",
                "Body text larger than 10pt",
                "Using author-date citations instead of numeric brackets",
                "Exceeding page limit — over-length desk rejection is common",
                "Figure captions above the figure (should be below; table captions go above)",
                "Not converting .doc to .pdf before submission",
            ],
            "special_notes": [
                "LaTeX (IEEEtran class) is strongly preferred and handles all formatting automatically",
                "Never adjust column margins or override font sizes",
                "IEEE copyright transfer required before publication",
                "Double-blind conferences: remove author names; replace self-citations with '[BLIND]'",
            ],
        },
        "samples": [
            {
                "id": "ieee_sample_01",
                "title": "Attention-Based Transformer Architectures for Real-Time Edge Inference",
                "description": "Systems/ML — architecture, experiments, ablation study in conference two-column format",
                "filename": "ieee_sample_01.docx",
            },
            {
                "id": "ieee_sample_02",
                "title": "Federated Learning Under Non-IID Heterogeneity: Convergence Analysis",
                "description": "Theory/systems — convergence theorem, algorithm description, empirical validation",
                "filename": "ieee_sample_02.docx",
            },
        ],
    },
    {
        "id": "oscola",
        "name": "OSCOLA",
        "full_name": "Oxford Standard for the Citation of Legal Authorities (4th ed.)",
        "authority": "University of Oxford Faculty of Law",
        "edition": "4th (2012)",
        "discipline": "Law (UK & Commonwealth), Legal Scholarship, Law Reviews, DPhil/LLM Theses",
        "template_source": "uploaded",
        "template_file": "oscola_template.docx",
        "color": "#7c3aed",
        "notes": {
            "overview": "OSCOLA is the standard citation system for UK legal academia and many Commonwealth jurisdictions. Unlike author-date styles, OSCOLA uses sequential footnote citations — the body text is free of parenthetical references. It has distinct citation rules for cases, legislation, treaties, and secondary sources.",
            "page_setup": "A4. Mirror margins for thesis: inner 1.34 in, outer 1.15 in, top/bottom 1.0 in. Single-column.",
            "font": "Cambria or Times New Roman 12pt body; 10pt footnotes.",
            "spacing": "1.5 line spacing for body. Footnotes single-spaced. Block quotations (>3 lines): indented 0.5 in, no quote marks, leave blank line above and below.",
            "citations": "Sequential footnotes (¹). First citation in full. Short form thereafter: surname (n X) page. Immediate repetition: ibid X. Never use op. cit. or loc. cit.",
            "cases": "English cases: Party v Party [Year] Volume Reporter Page (Court). Year in square brackets if essential to identify volume; round brackets otherwise. ECHR: Name v State (App No XXXXX/XX, ECtHR, date). CJEU: Case C-XXX/XX Name EU:C:year:number.",
            "legislation": "UK Act: Short Title Year. Specific provision: s 1(2)(a). EU Regulation: Reg (EU) No XXXX/Year [year] OJ LXXX/page.",
            "secondary": "Book: Author, Title (edition, Publisher Year). Article: Author, 'Title' (Year) Volume Abbreviation Page. Edited chapter: Author, 'Chapter' in Editor (ed), Book Title (Publisher Year) page.",
            "common_mistakes": [
                "Repeating full citation after first mention — use short form with cross-reference",
                "'ibid.' after an intervening citation — only for immediate repetitions",
                "Using full stop after 'ibid' — OSCOLA uses 'ibid' without full stop",
                "Wrong bracket type for case year — square brackets for law report volume year, round for date-identified reports",
                "Omitting comma between neutral citation and law report citation",
                "Missing bibliography for thesis (footnote-only is fine for articles)",
            ],
            "special_notes": [
                "OSCOLA is primarily a citation system, not a full formatting standard — check your institution's thesis requirements for margins/font",
                "Pinpoint: Brown (n 1) 215 or Brown (n 1) [20] for paragraph numbers",
                "URLs: <https://example.com> accessed 3 June 2026 — angle brackets and access date required",
                "Thesis bibliography should list sources consulted, not just cited",
            ],
        },
        "samples": [
            {
                "id": "oscola_sample_01",
                "title": "The Constitutionalisation of International Investment Law: SWFs and Host-State Discretion",
                "description": "DPhil thesis chapter — public international law, investor-state arbitration, footnote citations",
                "filename": "oscola_sample_01.docx",
            },
            {
                "id": "oscola_sample_02",
                "title": "Data Sovereignty and the Extraterritorial Reach of the GDPR",
                "description": "Comparative law thesis chapter — EU law, CJEU cases, legislation citations, bibliography",
                "filename": "oscola_sample_02.docx",
            },
        ],
    },
    {
        "id": "asa",
        "name": "ASA Style",
        "full_name": "American Sociological Association Style Guide (6th ed.)",
        "authority": "American Sociological Association",
        "edition": "6th (2019)",
        "discipline": "Sociology, Social Work, Criminology, Demography, Social Policy",
        "template_source": "uploaded",
        "template_file": "asa_template.docx",
        "color": "#0d9488",
        "notes": {
            "overview": "ASA style governs the American Sociological Review, American Journal of Sociology, Social Forces, and most sociology journals. It closely resembles APA in using author-date citations, but differs in several key ways: no comma before year, all-caps headings, and specific reference list formatting.",
            "page_setup": "8.5 × 11 inch. 1.25-inch margins all sides.",
            "font": "Times New Roman 12pt throughout.",
            "spacing": "Double-spaced throughout. First-line indent 0.5 in (except first paragraph of each section).",
            "headings": "Level 1: CENTRED ALL CAPS. Level 2: Italicised Title Case, Left-aligned. Level 3: Italicised, indented, run into paragraph, ends with period.",
            "citations": "(Smith 2020) — no comma before year (key difference from APA). Two authors: (Smith and Jones 2020). Three or more: (Smith et al. 2020). Pinpoint: (Smith 2020:34).",
            "references": "Alphabetical, hanging indent 0.5 in. Journal: Last, First. Year. \"Title.\" Journal Volume(Issue):pages. Book: Last, First. Year. Title. Publisher. Edited chapter: Last, First. Year. \"Chapter.\" Pp. XX–XX in Book, edited by First Last. Publisher.",
            "common_mistakes": [
                "Adding comma before year: (Smith, 2020) — ASA uses (Smith 2020)",
                "Using '&' in text: 'Smith & Jones' — ASA uses 'and' always",
                "Capitalising article/chapter titles in reference list",
                "'References' not in all caps — ASA heading style requires REFERENCES",
                "Using 'ed.' abbreviation — ASA writes 'edited by'",
            ],
            "special_notes": [
                "Endnotes preferred over footnotes; minimize their use",
                "Tables follow APA convention for formatting",
                "Appendices follow references, labelled Appendix A, Appendix B",
                "ASA style guide available from the ASA website or publisher",
            ],
        },
        "samples": [
            {
                "id": "asa_sample_01",
                "title": "Neighborhood Disadvantage and Health Disparities: The Mediating Role of Social Capital",
                "description": "Quantitative sociology — multilevel SEM, PHDCN data, mediation analysis",
                "filename": "asa_sample_01.docx",
            },
            {
                "id": "asa_sample_02",
                "title": "Credentialing and Occupational Closure: Licensing Requirements and Racial Stratification",
                "description": "Labour sociology — difference-in-differences design, CPS data 2000–2022",
                "filename": "asa_sample_02.docx",
            },
        ],
    },
    {
        "id": "ams",
        "name": "AMS Style",
        "full_name": "American Meteorological Society Author Guide",
        "authority": "American Meteorological Society",
        "edition": "Current (2023)",
        "discipline": "Atmospheric Sciences, Meteorology, Oceanography, Climate Science",
        "template_source": "uploaded",
        "template_file": "ams_template.docx",
        "color": "#ea580c",
        "notes": {
            "overview": "The AMS publishes BAMS, Journal of Climate, Monthly Weather Review, and other flagship atmospheric science journals. AMS style uses an author-year system adapted to physical-science conventions, with specific requirements for figures, mathematical notation, and mandatory data archiving statements.",
            "page_setup": "Manuscript submission: single-column, 1-inch margins, double-spaced. Final typeset: two-column.",
            "font": "Times New Roman 12pt for manuscript submission.",
            "abstract": "≤250 words. Optional Significance Statement (≤120 words, non-technical). BAMS-only CAPSULE (20–30 words).",
            "headings": "Level 1: 1. INTRODUCTION (numbered, ALL CAPS, bold). Level 2: a. Subsection (letter, title case, bold). Level 3: 1) sub-subsection (italic).",
            "citations": "Author-year: Smith (2020) or (Smith 2020). Multiple: (Smith 2020; Jones and Lee 2019). Three or more: Smith et al. (2020). 4+ authors in reference list: Author, A. B., and Coauthors.",
            "references": "Alphabetical. Journal: Author, A. B., and C. D. Author, Year: Title. J. Abbrev. Name, volume, pages, doi. Book: Author, Year: Title. Publisher, pages pp.",
            "figures": "Caption below figure: 'Fig. X. Caption text.' Table caption above: 'Table X. Caption.' All cited in order of appearance. ≥300 dpi for photos, ≥600 dpi for line art.",
            "common_mistakes": [
                "Single-spacing manuscript (AMS requires double-spacing for review)",
                "Missing DOI — required for all post-2016 journal articles",
                "Using 'et al.' in reference list with ≤3 authors",
                "Table captions below the table (should be above)",
                "Omitting mandatory data availability statement",
                "Writing 'Figure' in text — AMS uses 'Fig.'",
            ],
            "special_notes": [
                "AMS LaTeX template is available and recommended",
                "All datasets must be archived and cited as first-class references",
                "Color figures: no online charge; print color charges apply",
                "Significance statement (non-technical, ≤120 words) encouraged",
            ],
        },
        "samples": [
            {
                "id": "ams_sample_01",
                "title": "Convective Parameterization Uncertainty and Tropical Cyclone Intensity Forecasts in CMIP6",
                "description": "Climate science — perturbed-physics ensemble, multi-model bias evaluation",
                "filename": "ams_sample_01.docx",
            },
            {
                "id": "ams_sample_02",
                "title": "Urban Heat Island Intensification and Nocturnal Temperature Trends across 47 U.S. Cities",
                "description": "Observational climatology — station data trend analysis, IBTrACS/GHCN-D",
                "filename": "ams_sample_02.docx",
            },
        ],
    },
    {
        "id": "chicago_notes",
        "name": "Chicago Notes-Bibliography",
        "full_name": "The Chicago Manual of Style — Notes and Bibliography (17th ed.)",
        "authority": "University of Chicago Press",
        "edition": "17th (2017)",
        "discipline": "History, Arts, Literature, Humanities, Philosophy, Theology",
        "template_source": "internet",
        "template_url": "https://www.chicagomanualofstyle.org/tools_citationguide/citation-guide-1.html",
        "color": "#dc2626",
        "notes": {
            "overview": "Chicago's Notes-Bibliography (NB) system is the dominant citation style in the humanities. Citations go in numbered footnotes or endnotes, keeping the prose clean of parenthetical references. A bibliography at the end lists all sources consulted — note this is a bibliography (all sources) not a reference list (only cited sources).",
            "page_setup": "8.5 × 11 inch. 1-inch margins. Header with page numbers.",
            "font": "12pt serif (Times New Roman). Footnotes: 10pt.",
            "spacing": "Double-spaced body. Single-spaced footnotes, single-spaced bibliography with blank line between entries.",
            "footnotes": "Superscript number after punctuation.¹ Full first citation: Author First Last, Title (Publisher, Year), page. Subsequent: Last, short title, page. Ibid. for immediate repetition only.",
            "bibliography": "Alphabetical by surname. Last, First. Title. Publisher, Year. Article: Last, First. \"Title.\" Journal Volume, no. Issue (Year): pages.",
            "common_mistakes": [
                "Name order: footnotes = First Last; bibliography = Last, First",
                "Using ibid. after intervening citation — only for immediate repeats",
                "Double-spacing the bibliography (single-spaced with blank lines between entries)",
                "Omitting access date for online sources",
                "Treating bibliography as reference list — NB style often includes sources consulted but not cited",
            ],
        },
        "samples": None,
    },
    {
        "id": "chicago_authordate",
        "name": "Chicago Author-Date",
        "full_name": "The Chicago Manual of Style — Author-Date System (17th ed.)",
        "authority": "University of Chicago Press",
        "edition": "17th (2017)",
        "discipline": "Natural Sciences, Social Sciences, Anthropology, Economics (some fields)",
        "template_source": "internet",
        "template_url": "https://www.chicagomanualofstyle.org/tools_citationguide/citation-guide-2.html",
        "color": "#b45309",
        "notes": {
            "overview": "Chicago's Author-Date system is used in the natural and social sciences. It functions similarly to APA but follows Chicago reference list conventions. Key difference from APA: no comma between author and year in citations.",
            "citations": "(Smith 2020) or Smith (2020). No comma. Page: (Smith 2020, 45). Multiple: (Smith 2020; Jones 2019).",
            "references": "Reference list (not bibliography), alphabetical. Book: Last, First. Year. Title. Publisher. Journal: Last, First. Year. \"Article.\" Journal Volume (Issue): pages.",
            "common_mistakes": [
                "Adding comma before year: (Smith, 2020) — Chicago omits comma",
                "Using footnote format in author-date paper",
                "Sentence-casing journal/book titles in reference list (Chicago capitalises titles)",
            ],
        },
        "samples": None,
    },
    {
        "id": "mla9",
        "name": "MLA 9th Edition",
        "full_name": "MLA Handbook (9th ed.)",
        "authority": "Modern Language Association",
        "edition": "9th (2021)",
        "discipline": "Literature, Languages, Comparative Literature, Cultural Studies, Film Studies",
        "template_source": "internet",
        "template_url": "https://style.mla.org/mla-format/",
        "color": "#0284c7",
        "notes": {
            "overview": "MLA is the standard for literary and linguistic studies. The 9th edition (2021) introduced a universal 'container' template replacing medium-specific rules. In-text citations use author-page (not author-date).",
            "page_setup": "8.5 × 11 inch. 1-inch margins. Header: Last Name + page number, top right.",
            "font": "12pt (Times New Roman preferred). Double-spaced.",
            "citations": "Author-page: (Smith 45). No comma. No 'p.' before page number. Block quotes (>4 prose lines): indented 0.5 in, no quotation marks.",
            "works_cited": "'Works Cited' (not 'References'). Container model: Author. \"Source.\" Container, Contributor, Version, Number, Publisher, Date, Location.",
            "common_mistakes": [
                "Author-date citations — MLA uses author-page",
                "'References' instead of 'Works Cited'",
                "Omitting hanging indent in Works Cited",
                "Incorrect container hierarchy for databases or streaming",
            ],
        },
        "samples": None,
    },
    {
        "id": "harvard_citethemright",
        "name": "Harvard (Cite Them Right)",
        "full_name": "Cite Them Right — The Essential Referencing Guide (11th ed.)",
        "authority": "Palgrave Macmillan / Northumbria University",
        "edition": "11th (2019)",
        "discipline": "Widely used across UK universities — Business, Law, Social Sciences, Sciences",
        "template_source": "internet",
        "template_url": "https://www.citethemrightonline.com/",
        "color": "#16a34a",
        "notes": {
            "overview": "Harvard referencing is a family of author-date styles, not a single standard. 'Cite Them Right' is the most widely adopted UK variant. Always verify your institution's specific guidelines as conventions differ between universities.",
            "citations": "(Author, Year) — comma before year (unlike ASA/Chicago). Pinpoint: (Author, Year: page). Multiple: (Author, Year; Author, Year).",
            "references": "Alphabetical. Author, Initials. (Year) Title. Edition. Place: Publisher. Journal: Author, Initials. (Year) 'Article title'. Journal Name, volume(issue), pp. X–Y.",
            "common_mistakes": [
                "Treating Harvard as a single authoritative standard — check institutional guidelines",
                "Capitalising article titles (sentence case only in reference list)",
                "Missing comma before year in text citation",
            ],
        },
        "samples": None,
    },
    {
        "id": "vancouver",
        "name": "Vancouver",
        "full_name": "Vancouver Reference Style (ICMJE Recommendations)",
        "authority": "International Committee of Medical Journal Editors",
        "edition": "Current (2023)",
        "discipline": "Medicine, Biomedical Sciences, Nursing, Pharmacy, Public Health",
        "template_source": "internet",
        "template_url": "https://www.nlm.nih.gov/bsd/uniform_requirements.html",
        "color": "#0891b2",
        "notes": {
            "overview": "Vancouver style is the standard for biomedical journals worldwide (The Lancet, NEJM, BMJ, JAMA). Numeric citations in order of appearance; references listed numerically at end.",
            "citations": "Superscript numbers: Smith et al.¹ or bracketed [1]. Ranges: ²⁻⁵ or [2-5].",
            "references": "Numbered, order of appearance. Journal: Author AB, et al. Title. J Abbrev. Year;vol(issue):pages. doi. Up to 6 authors, then 'et al.'",
            "common_mistakes": [
                "Author-date format — Vancouver is numeric",
                "Spelling out journal names — use NLM abbreviations",
                ">6 authors without 'et al.'",
                "Including issue number for continuously paginated journals",
            ],
        },
        "samples": None,
    },
    {
        "id": "ama11",
        "name": "AMA 11th Edition",
        "full_name": "AMA Manual of Style: A Guide for Authors and Editors (11th ed.)",
        "authority": "American Medical Association",
        "edition": "11th (2020)",
        "discipline": "Medicine, Biomedical Research, Public Health (JAMA Network journals)",
        "template_source": "internet",
        "template_url": "https://www.amamanualofstyle.com/",
        "color": "#be185d",
        "notes": {
            "overview": "AMA style governs JAMA Network journals and is used broadly in medical education. Like Vancouver, numeric; but with detailed additional rules for clinical nomenclature, statistical reporting (P capitalised and italicised), abbreviations, and ethical disclosures.",
            "citations": "Superscript Arabic numerals in text order of appearance: ¹,³,⁵ or ¹⁻³. Same reference cited again: reuse original number.",
            "references": "Numbered, order of appearance. Journal: Author AB, Author CD, et al. Title. J Abbrev. Year;vol(issue):pages. doi:10.XXXX",
            "common_mistakes": [
                "Spelling out journal names — AMA requires NLM abbreviations",
                "Alphabetising references — AMA orders by appearance",
                "Lowercase 'p' for P values — AMA capitalises P",
                "'Figure' abbreviated as 'Fig.' — AMA spells it out",
            ],
        },
        "samples": None,
    },
]

_BY_ID = {s["id"]: s for s in CATALOG}


@router.get("/")
def list_styles():
    return [
        {
            "id": s["id"],
            "name": s["name"],
            "authority": s["authority"],
            "edition": s["edition"],
            "discipline": s["discipline"],
            "template_source": s["template_source"],
            "template_url": s.get("template_url"),
            "has_template_file": bool(s.get("template_file")),
            "has_samples": bool(s.get("samples")),
            "sample_count": len(s["samples"]) if s.get("samples") else 0,
            "color": s.get("color", "#6366f1"),
        }
        for s in CATALOG
    ]


@router.get("/{style_id}")
def get_style(style_id: str):
    s = _BY_ID.get(style_id)
    if not s:
        raise HTTPException(404, f"Style '{style_id}' not found")
    return s


@router.get("/{style_id}/template-file")
def download_template(style_id: str):
    s = _BY_ID.get(style_id)
    if not s:
        raise HTTPException(404, f"Style '{style_id}' not found")
    if not s.get("template_file"):
        raise HTTPException(404, "No template file — see template_url")
    path = _OFFICIAL_DIR / s["template_file"]
    if not path.exists():
        raise HTTPException(404, "Template file not on server")
    return FileResponse(str(path), media_type="application/octet-stream", filename=s["template_file"])


@router.get("/{style_id}/samples/{sample_id}")
def download_sample(style_id: str, sample_id: str):
    s = _BY_ID.get(style_id)
    if not s or not s.get("samples"):
        raise HTTPException(404, "Style or samples not found")
    sample = next((x for x in s["samples"] if x["id"] == sample_id), None)
    if not sample:
        raise HTTPException(404, "Sample not found")
    path = _SAMPLES_DIR / sample["filename"]
    if not path.exists():
        raise HTTPException(404, "Sample file not on server")
    return FileResponse(
        str(path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=sample["filename"],
    )
