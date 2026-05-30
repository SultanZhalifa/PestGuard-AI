"""
Convert docs/proposal.md -> a formatted PDF that follows the official
AI Open 2026 guidelines:
    - A4 size, 2.54 cm margins, 1.15 line spacing
    - Times New Roman, 12 pt main text
    - Internal "(Max NNN words)" annotations stripped
Output filename: "Andalusia_Sultan Zhalifunnas Musyaffa_Proposal AI Open 2026.pdf"

Run from repo root:
    backend/venv/Scripts/python.exe docs/build_proposal_pdf.py
"""
import re
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "proposal.md"
OUT = ROOT / "Andalusia_Sultan Zhalifunnas Musyaffa_Proposal AI Open 2026.pdf"

LEADING = 1.15  # line spacing

# ── Styles (Times New Roman = reportlab's built-in "Times-Roman") ──
styles = getSampleStyleSheet()
BODY = ParagraphStyle(
    "Body", parent=styles["Normal"], fontName="Times-Roman",
    fontSize=12, leading=12 * LEADING, alignment=TA_LEFT, spaceAfter=6,
)
H1 = ParagraphStyle(
    "H1", parent=BODY, fontName="Times-Bold", fontSize=18,
    leading=18 * LEADING, spaceBefore=14, spaceAfter=8, textColor=colors.HexColor("#0f172a"),
)
H2 = ParagraphStyle(
    "H2", parent=BODY, fontName="Times-Bold", fontSize=14,
    leading=14 * LEADING, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor("#1e293b"),
)
H3 = ParagraphStyle(
    "H3", parent=BODY, fontName="Times-Bold", fontSize=12.5,
    leading=12.5 * LEADING, spaceBefore=8, spaceAfter=4, textColor=colors.HexColor("#334155"),
)
TITLE = ParagraphStyle(
    "Title", parent=BODY, fontName="Times-Bold", fontSize=20,
    leading=22, alignment=TA_CENTER, spaceAfter=14,
)
CELL = ParagraphStyle("Cell", parent=BODY, fontSize=11, leading=11 * LEADING, spaceAfter=0)


def inline(text: str) -> str:
    """Convert markdown inline (**bold**, *italic*, `code`) to reportlab markup."""
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"`(.+?)`", r'<font face="Courier">\1</font>', text)
    return text


def main():
    md = SRC.read_text(encoding="utf-8")
    # Strip internal word-count annotations like *(Max 200 words)* and *(... trim ...)*
    md = re.sub(r"^\s*\*\(.*?\)\*\s*$", "", md, flags=re.MULTILINE)

    lines = md.split("\n")
    flow = []
    i = 0
    table_buf = []

    def flush_table():
        nonlocal table_buf
        if not table_buf:
            return
        # Parse markdown table rows
        rows = []
        for r in table_buf:
            cells = [c.strip() for c in r.strip().strip("|").split("|")]
            rows.append(cells)
        # Drop separator row (---)
        rows = [r for r in rows if not all(set(c) <= set("-: ") for c in r)]
        if rows:
            data = [[Paragraph(inline(c), CELL) for c in row] for row in rows]
            ncols = max(len(r) for r in data)
            # pad
            for r in data:
                while len(r) < ncols:
                    r.append(Paragraph("", CELL))
            tbl = Table(data, hAlign="LEFT", colWidths=[(16.92 * cm) / ncols] * ncols)
            tbl.setStyle(TableStyle([
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            flow.append(tbl)
            flow.append(Spacer(1, 8))
        table_buf = []

    first_h1 = True
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Table rows accumulate
        if stripped.startswith("|") and stripped.endswith("|"):
            table_buf.append(stripped)
            i += 1
            continue
        else:
            flush_table()

        if not stripped:
            i += 1
            continue

        if stripped == "---":
            flow.append(Spacer(1, 4))
            flow.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#cbd5e1")))
            flow.append(Spacer(1, 6))
        elif stripped.startswith("### "):
            flow.append(Paragraph(inline(stripped[4:]), H3))
        elif stripped.startswith("## "):
            flow.append(Paragraph(inline(stripped[3:]), H2))
        elif stripped.startswith("# "):
            if first_h1:
                flow.append(Paragraph(inline(stripped[2:]), TITLE))
                first_h1 = False
            else:
                flow.append(Paragraph(inline(stripped[2:]), H1))
        elif re.match(r"^\d+\.\s", stripped):
            flow.append(Paragraph(inline(stripped), BODY, bulletText="•"))
        elif stripped.startswith("- ") or stripped.startswith("* "):
            flow.append(Paragraph(inline(stripped[2:]), BODY, bulletText="•"))
        else:
            flow.append(Paragraph(inline(stripped), BODY))
        i += 1

    flush_table()

    doc = SimpleDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=2.54 * cm, rightMargin=2.54 * cm,
        topMargin=2.54 * cm, bottomMargin=2.54 * cm,
        title="Proposal AI Open 2026 - Andalusia - PestGuard AI",
        author="Team Andalusia",
    )
    doc.build(flow)
    print(f"[OK] PDF written: {OUT}")
    print(f"[OK] Size: {OUT.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
