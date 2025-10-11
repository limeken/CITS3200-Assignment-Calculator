from weasyprint import HTML, CSS
from io import BytesIO
from textwrap import dedent
from datetime import date, datetime
import html as _html
from itertools import groupby

def _esc(s) -> str:
    return _html.escape("" if s is None else str(s))

def _fmt_date(s: str) -> str:
    if not s:
        return ""
    try:
        if len(s) == 10:
            dt = datetime.strptime(s, "%Y-%m-%d")
        else:
            dt = datetime.fromisoformat(s)
        return dt.strftime("%a, %d %b %Y")
    except Exception:
        return s

def _parse_date(s: str) -> date | None:
    if not s:
        return None
    try:
        if len(s) == 10:
            return datetime.strptime(s, "%Y-%m-%d").date()
        return datetime.fromisoformat(s).date()
    except Exception:
        return None

def _collect_summary(assignments):
    total_assignments = len(assignments)
    total_milestones = sum(len(a.get("milestones") or []) for a in assignments)
    all_dues = sorted([a.get("due_date") for a in assignments if a.get("due_date")])
    date_range = f"{_esc(_fmt_date(all_dues[0]))} – {_esc(_fmt_date(all_dues[-1]))}" if all_dues else "—"
    return total_assignments, total_milestones, date_range

def _all_milestones(assignments):
    """Flatten milestones and attach unit/title/type per item."""
    items = []
    for a in assignments:
        unit = a.get("unit") or "(No unit)"
        title = a.get("title") or ""
        atype = (a.get("type") or "").title()
        for m in (a.get("milestones") or []):
            d = _parse_date(m.get("date"))
            if not d:  # skip bad dates
                continue
            items.append({
                "date": d,
                "date_str": d.isoformat(),
                "date_human": _fmt_date(d.isoformat()),
                "unit": unit,
                "title": title,
                "type": atype,
                "milestone": m.get("name") or "",
            })
    # sort by date
    items.sort(key=lambda x: x["date"])
    return items

def _group_by_iso_week(items):
    """Group flattened milestone items into ISO year-week buckets."""
    # key as (iso_year, iso_week)
    def keyer(it):
        iso_year, iso_week, _ = it["date"].isocalendar()
        return (iso_year, iso_week)
    grouped = []
    for (y, w), chunk in groupby(items, keyer):
        chunk = list(chunk)
        # Pretty week heading like "2025 • Week 42 (13–19 Oct)"
        start_of_week = chunk[0]["date"]
        # compute Monday..Sunday range
        weekday = start_of_week.weekday()  # Mon=0
        monday = start_of_week if weekday == 0 else start_of_week.fromordinal(start_of_week.toordinal() - weekday)
        sunday = monday.fromordinal(monday.toordinal() + 6)
        heading = f"{y} • Week {w:02d} ({_fmt_date(monday.isoformat())} – {_fmt_date(sunday.isoformat())})"
        grouped.append({
            "iso_year": y,
            "iso_week": w,
            "heading": heading,
            "items": chunk,
        })
    return grouped

def _crest_svg():
    # Simple, clean inline crest-ish mark (not official branding)
    # (Rect shield + chevron) — purely decorative so no external asset is needed.
    return (
        '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">'
        '  <defs>'
        '    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">'
        '      <stop offset="0%" stop-color="#003A70"/>'
        '      <stop offset="100%" stop-color="#0056B3"/>'
        '    </linearGradient>'
        '  </defs>'
        '  <path d="M3 3 h16 v9 a8 8 0 0 1 -8 8 a8 8 0 0 1 -8 -8 z" fill="url(#g1)"/>'
        '  <path d="M6 8 l5 4 l5 -4" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
        '</svg>'
    )

def build_plan_pdf(plan: dict) -> BytesIO:
    assignments = plan.get("assignments", [])
    total_assignments, total_milestones, date_range = _collect_summary(assignments)
    flat = _all_milestones(assignments)
    by_week = _group_by_iso_week(flat)

    # Build weekly sections (ISO week headings → rows)
    week_sections = []
    for wk in by_week:
        rows = []
        for it in wk["items"]:
            rows.append(f"""
              <div class="row">
                <div class="col date">{_esc(it['date_human'])}</div>
                <div class="col main">
                  <span class="unit">[{_esc(it['unit'])}]</span>
                  <span class="title">{_esc(it['title'])}</span>
                  <span class="dot">•</span>
                  <span class="milestone">{_esc(it['milestone'])}</span>
                  {f'<span class="dot">•</span><span class="type">{_esc(it["type"])}</span>' if it['type'] else ''}
                </div>
              </div>
            """)
        week_sections.append(f"""
          <section class="week">
            <h2>{_esc(wk["heading"])}</h2>
            <div class="rows">{''.join(rows)}</div>
          </section>
        """)

    crest = _crest_svg()

    html = dedent(f"""
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          /* --- Page + Accessibility defaults --- */
          @page {{
            size: A4;
            margin: 18mm;
            @bottom-center {{
              content: "UWA Assignment Planner — " counter(page) " / " counter(pages);
              font-size: 11px; /* ↑ slightly larger for readability */
              color: #1f2937;  /* stronger contrast */
            }}
          }}
          :root {{
            /* WCAG AA-friendly palette */
            --ink:#0b0f19;     /* deep neutral */
            --muted:#374151;   /* slate-700 */
            --line:#9ca3af;    /* gray-400 (stronger than #e5e7eb) */
            --bg:#ffffff;
            --bg-alt:#f3f4f6;  /* gray-100 */
            --brand:#003A70;   /* UWA-ish blue */
            --accent:#1d4ed8;  /* blue-700 */
            --chip:#e0e7ff;    /* indigo-100 */
          }}
          * {{ box-sizing: border-box; }}
          body {{
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 13px; /* ↑ base size for legibility */
            line-height: 1.45;
            color: var(--ink);
            background: var(--bg);
          }}

          /* --- Header / Brand --- */
          .brandbar {{ display:flex; align-items:center; gap:10px; margin-bottom: 8px; }}
          .brandtext {{ font-weight: 800; font-size: 18px; color: var(--brand); }}
          .meta {{ color: var(--muted); font-size: 12px; margin: 2px 0 12px; }}

          /* --- Summary chips --- */
          .summary {{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom: 12px; }}
          .chip {{
            border:1px solid var(--line);
            border-radius:999px;
            padding:5px 10px;
            background: var(--chip);
            color:#111827;
            font-weight:600;
          }}

          /* --- Week sections --- */
          h2 {{
            font-size: 16px;
            margin: 16px 0 8px;
            padding-bottom: 6px;
            border-bottom: 2px solid var(--line); /* stronger separator for contrast */
            color: var(--ink);
          }}
          .week {{ page-break-inside: avoid; margin-bottom: 10px; }}

          .rows {{ display:flex; flex-direction:column; gap:6px; }}
          .row {{
            display:grid;
            grid-template-columns: 180px 1fr; /* fixed date column, readable */
            gap: 10px;
            padding: 8px;
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--bg);
            page-break-inside: avoid;
          }}
          .row:nth-child(even) {{ background: var(--bg-alt); }} /* subtle zebra */

          .col.date {{ font-weight: 700; white-space:nowrap; }}
          .col.main {{ display:flex; flex-wrap:wrap; gap:6px; align-items:baseline; }}
          .unit {{ font-weight: 700; color: var(--brand); }}
          .title {{ font-weight: 600; }}
          .milestone {{ font-weight: 500; color: var(--accent); }}
          .type {{ color: var(--muted); }}
          .dot {{ color: var(--line); }}

          /* --- Utility --- */
          .sr-only {{
            position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
            overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
          }}
        </style>
      </head>
      <body>
        <div class="brandbar">
          {crest}
          <span class="brandtext">University of Western Australia — Assignment Plan</span>
        </div>

        <div class="meta">
          <b>Plan ID:</b> {_esc(plan.get('plan_id',''))} ·
          <b>Generated:</b> {date.today().isoformat()}
        </div>

        <div class="summary" role="group" aria-label="Plan summary">
          <span class="chip">Assignments: {total_assignments}</span>
          <span class="chip">Milestones: {total_milestones}</span>
          <span class="chip">Due-date range: {date_range}</span>
        </div>

        {"".join(week_sections) if week_sections else "<p>No milestones to show.</p>"}
      </body>
    </html>
    """)

    pdf_io = BytesIO()
    HTML(string=html).write_pdf(target=pdf_io, stylesheets=[CSS(string="")])
    pdf_io.seek(0)
    return pdf_io

