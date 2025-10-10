# app/services/pdf.py
from weasyprint import HTML, CSS
from flask import make_response
from textwrap import dedent
from datetime import date

def build_plan_pdf(plan: dict):
    a = plan.get("assignments", [])
    # group by unit
    by_unit = {}
    for x in a:
        by_unit.setdefault(x.get("unit","(No unit)"), []).append(x)

    # rows HTML
    def row(unit, title, due, mlist):
        ms = "".join(f"<li>{m['name']} – {m['date']}</li>" for m in (mlist or []))
        return f"""
        <tr>
          <td>{unit}</td>
          <td>{title}</td>
          <td>{due or ""}</td>
          <td><ul>{ms}</ul></td>
        </tr>"""

    sections = []
    for unit, items in by_unit.items():
        items = sorted(items, key=lambda x: x.get("due_date") or "9999-12-31")
        rows = "".join(row(unit, it.get("title",""), it.get("due_date",""), it.get("milestones")) for it in items)
        sections.append(f"""
          <h2>{unit}</h2>
          <table class="grid"><thead>
            <tr><th>Unit</th><th>Title</th><th>Due</th><th>Milestones</th></tr>
          </thead><tbody>{rows}</tbody></table>
        """)

    html = dedent(f"""
    <html>
    <head><meta charset="utf-8">
      <style>
        @page {{ size: A4; margin: 20mm; @bottom-center {{ content: "UWA Assignment Planner — {{page}}/{{pages}}"; font-size: 10px; color: #666; }} }}
        body {{ font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }}
        .title {{ display:flex; align-items:center; gap:12px; margin-bottom: 12px; }}
        .brand {{ font-size: 22px; font-weight: 700; }}
        .meta  {{ color:#555; font-size: 12px; margin-bottom: 16px; }}
        h2 {{ font-size: 16px; margin: 18px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }}
        table.grid {{ width:100%; border-collapse: collapse; }}
        th, td {{ border: 1px solid #e5e7eb; padding: 8px; vertical-align: top; font-size: 12px; }}
        thead th {{ background: #f3f4f6; text-align:left; }}
        tbody tr:nth-child(even) {{ background: #fafafa; }}
        ul {{ margin:0; padding-left: 18px; }}
      </style>
    </head>
    <body>
      <div class="title">
        <div class="brand">University of Western Australia — Assignment Plan</div>
      </div>
      <div class="meta">
        <div><b>Plan ID:</b> {plan.get('plan_id','')}</div>
        <div><b>Generated:</b> {date.today().isoformat()}</div>
      </div>
      {''.join(sections) if sections else "<p>No assignments yet.</p>"}
    </body></html>
    """)

    pdf_bytes = HTML(string=html).write_pdf(stylesheets=[CSS(string="")])
    resp = make_response(pdf_bytes)
    resp.headers["Content-Type"] = "application/pdf"
    resp.headers["Content-Disposition"] = f"attachment; filename=plan_{plan.get('plan_id','')}.pdf"
    return resp
