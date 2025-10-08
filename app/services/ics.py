from icalendar import Calendar, Event
from datetime import datetime
from io import BytesIO

def build_plan_ics(plan: dict) -> BytesIO:
    cal = Calendar()
    cal.add("prodid", "-//UWA Assignment Planner//CITS3200//")
    cal.add("version", "2.0")

    for a in plan.get("assignments", []):
        unit = a.get("unit", "")
        title = a.get("title", "")
        for m in a.get("milestones", []):
            d = datetime.fromisoformat(m["date"]).date()
            ev = Event()
            ev.add("summary", f"{unit}: {title} — {m['name']}")
            ev.add("dtstart", d)  # all-day
            ev.add("dtend", d)
            cal.add_component(ev)

    buf = BytesIO()
    buf.write(cal.to_ical())
    buf.seek(0)
    return buf