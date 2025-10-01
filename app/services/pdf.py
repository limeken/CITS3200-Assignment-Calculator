# app/services/pdf.py
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

def build_plan_pdf(plan: dict) -> BytesIO:
    """
    Build a simple, readable one-page PDF of a plan:
    - UWA header placeholder
    - Plan metadata
    - Assignments table with milestones (if present)
    Returns an in-memory BytesIO ready to send.
    """
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        title=f"UWA Assignment Plan {plan.get('plan_id','')}",
        author="UWA Assignment Planner",
        leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Header", fontSize=16, leading=20, spaceAfter=8, alignment=1))  # centered
    styles.add(ParagraphStyle(name="Subtle", fontSize=9, textColor=colors.grey))
    styles.add(ParagraphStyle(name="Section", fontSize=12, leading=14, spaceBefore=12, spaceAfter=6,))

    story = []

    # Header
    story.append(Paragraph("University of Western Australia", styles["Header"]))
    story.append(Paragraph("Assignment Planner — PDF Export (v1)", styles["Normal"]))
    story.append(Paragraph(f"Generated: {datetime.utcnow().isoformat(timespec='seconds')}Z", styles["Subtle"]))
    story.append(Spacer(1, 8))

    # Plan metadata
    plan_id = plan.get("plan_id", "—")
    created = plan.get("created_utc", "—")
    version = plan.get("version", "v1")
    story.append(Paragraph(f"<b>Plan ID:</b> {plan_id}", styles["Normal"]))
    story.append(Paragraph(f"<b>Created (UTC):</b> {created}", styles["Normal"]))
    story.append(Paragraph(f"<b>Version:</b> {version}", styles["Normal"]))

    # Assignments table
    story.append(Paragraph("Assignments", styles["Section"]))
    data = [["Unit", "Title", "Start", "Due", "Milestones"]]

    for a in plan.get("assignments", []):
        unit = a.get("unit_code", "")
        title = a.get("title", "")
        start = a.get("start_date", "")
        due = a.get("due_date", "")
        ms = a.get("milestones") or []
        # milestone lines: "YYYY-MM-DD - Name"
        ms_lines = [f"{m.get('date','')} - {m.get('name','')}" for m in ms]
        ms_text = "\n".join(ms_lines) if ms_lines else "—"
        data.append([unit, title, start, due, ms_text])

    tbl = Table(data, colWidths=[60, 160, 70, 70, 180])
    tbl.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#e6eef7")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.HexColor("#003366")),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("LEFTPADDING", (0,0), (-1,-1), 4),
        ("RIGHTPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING", (0,0), (-1,-1), 4),
    ]))
    story.append(tbl)

    # Footer note
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Dates are ISO-8601 (UTC internally). Milestones are generated evenly and may be staggered to avoid collisions.",
        styles["Subtle"]
    ))

    doc.build(story)
    buf.seek(0)
    return buf
