# app/services/pdf.py
from weasyprint import HTML, CSS
from io import BytesIO
from textwrap import dedent
from datetime import date, datetime
import html as _html

def _esc(s: str) -> str:
    return _html.escape(str(s or ""))

def _fmt_date(s: str) -> str:
    # Accept 'YYYY-MM-DD' or full ISO; fall back to original if parse fails.
    if not s:
        return ""
    try:
        if len(s) == 10:
            dt = datetime.strptime(s, "%Y-%m-%d")
        else:
            dt = datetime.fromisoformat(s)
        # Output as ‘Mon, 20 Oct 2025’
        return dt.strftime("%a, %d %b %Y")
    except Exception:
        return s

def build_plan_pdf(plan: dict) -> BytesIO:
    assignments = plan.get("assignments", [])

    # ---- group by unit and sort by due date
    by_unit = {}
    for a in assignments:
        unit = a.get("unit") or "(No unit)"
        by_unit.setdefault(unit, []).append(a)

    for unit, items in by_unit.items():
        items.sort(key=lambda x: x.get("due_date") or "9999-12-31")

    # ---- derive summary numbers
    total_assignments = len(assignments)
    total_milestones = sum(len(a.get("milestones") or []) for a in assignments)
    all_dates = sorted([a.get("due_date") for a in assignments if a.get("due_date")])
    date_range = f"{_fmt_date(all_dates[0])} – {_fmt_date(all_dates[-1])}" if all_dates else "—"

    # ---- build per-unit sections
    unit_sections = []
    for unit, items in by_unit.items():
        rows = []
        for a in items:
            milestones = a.get("milestones") or []
            ms_html = "<ul>" + "".join(
                f"<li>{_esc(m.get('name',''))} — {_esc(_fmt_date(m.get('date')))}</li>"
                for m in milestones
            ) + "</ul>" if milestones else "<span class='muted'>No milestones</span>"

            rows.append(f"""
              <tr>
                <td class="unit">{_esc(unit)}</td>
                <td>{_esc(a.get('title',''))}</td>
                <td class="nowrap">{_esc(_fmt_date(a.get('due_date')))}</td>
                <td>{ms_html}</td>
              </tr>
            """)

        unit_sections.append(f"""
          <section class="unit-section">
            <h2>{_esc(unit)}</h2>
            <table class="grid">
              <thead>
                <tr><th>Unit</th><th>Title</th><th>Due</th><th>Milestones</th></tr>
              </thead>
              <tbody>
                {''.join(rows)}
              </tbody>
            </table>
          </section>
        """)

    # ---- full HTML (no external fonts or CSS)
    html = dedent(f"""
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {{
            size: A4;
            margin: 20mm;
            @bottom-center {{
              content: "UWA Assignment Planner — " counter(page) " / " counter(pages);
              font-size: 10px;
              color: #666;
            }}
          }}
          :root {{
            --border: #e5e7eb;
            --bg-alt: #fafafa;
            --thead: #f3f4f6;
            --text-muted: #6b7280;
          }}
          body {{
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 12px;
            color: #111827;
          }}
          .title {{
            display: flex; align-items: center; gap: 12px; margin-bottom: 6px;
          }}
          .brand {{ font-size: 22px; font-weight: 700; }}
          .meta  {{ color: var(--text-muted); font-size: 12px; margin-bottom: 14px; }}
          .summary {{
            border: 1px solid var(--border);
            padding: 10px; border-radius: 6px; margin-bottom: 12px;
            background: #fff;
          }}
          h1, h2 {{ margin: 0; }}
          h2 {{
            font-size: 16px; margin: 18px 0 8px;
            border-bottom: 1px solid var(--border); padding-bottom: 4px;
          }}
          table.grid {{
            width: 100%; border-collapse: collapse; table-layout: fixed;
          }}
          th, td {{
            border: 1px solid var(--border); padding: 8px; vertical-align: top;
          }}
          thead th {{ background: var(--thead); text-align: left; }}
          tbody tr:nth-child(even) {{ background: var(--bg-alt); }}
          td.unit {{ width: 18%; }}
          td.nowrap {{ white-space: nowrap; }}
          ul {{ margin: 0; padding-left: 18px; }}
          .muted {{ color: var(--text-muted); }}
          .unit-section {{ page-break-inside: avoid; margin-bottom: 10px; }}
        </style>
      </head>
      <body>
        <div class="title">
          <div class="brand">University of Western Australia — Assignment Plan</div>
        </div>
        <div class="meta">
          <div><b>Plan ID:</b> {_esc(plan.get('plan_id',''))}</div>
          <div><b>Generated:</b> {date.today().isoformat()}</div>
        </div>

        <div class="summary">
          <b>Summary:</b>
          <span>Assignments: {total_assignments}</span> ·
          <span>Milestones: {total_milestones}</span> ·
          <span>Due-date range: {date_range}</span>
        </div>

        {''.join(unit_sections) if unit_sections else "<p class='muted'>No assignments yet.</p>"}
      </body>
    </html>
    """)

    # WeasyPrint -> BytesIO (so routes can use send_file)
    pdf_io = BytesIO()
    HTML(string=html).write_pdf(target=pdf_io, stylesheets=[CSS(string="")])
    pdf_io.seek(0)
    return pdf_io
