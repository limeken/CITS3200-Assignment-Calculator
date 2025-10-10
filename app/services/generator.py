from datetime import date, datetime, timedelta
from typing import List, Dict, Any

# Milestone templates by assignment type
MILESTONES_BY_TYPE: Dict[str, List[str]] = {
    "essay":        ["Research", "Outline", "Draft", "Revise", "Finalise"],
    "report":       ["Gather", "Analyse", "Draft", "Edit", "Finalise"],
    "lab":          ["Prep", "Experiment", "Analyse", "Writeup"],
    "presentation": ["Plan", "Draft", "Slides", "Rehearse", "Finalise"],
    "exam_prep":    ["Plan", "Study", "Practice", "Review"],
    "quiz":         ["Study 1", "Study 2", "Review"],
    "other":        ["Start", "Midpoint", "Finalise"],
}

def _parse_date(iso_str: str) -> date:
    s = (iso_str or "").strip()
    if not s:
        raise ValueError("missing date")
    try:
        if len(s) == 10:
            return datetime.strptime(s, "%Y-%m-%d").date()
        return datetime.fromisoformat(s).date()
    except Exception as e:
        raise ValueError(f"invalid date '{s}' (expected YYYY-MM-DD)") from e

def _evenly_spaced_in_window(start: date, due: date, count: int) -> List[date]:
    # never place on/after due; try to distribute between start..(due-1)
    total = (due - start).days
    last_day = max(1, total - 1)
    out: List[date] = []
    for k in range(1, count + 1):
        pos = round(k * (last_day / (count + 1)))
        pos = max(1, min(last_day, pos))
        out.append(start + timedelta(days=pos))
    # strictly increasing
    for i in range(1, len(out)):
        if out[i] <= out[i - 1]:
            out[i] = min(due - timedelta(days=1), out[i - 1] + timedelta(days=1))
    return out

def _resolve_collisions(all_dates: Dict[date, int], d: date, start: date, due: date) -> date:
    if all_dates.get(d, 0) == 0:
        return d
    # try forward then backward for up to 7 days each
    f = d
    for _ in range(7):
        f = min(due - timedelta(days=1), f + timedelta(days=1))
        if all_dates.get(f, 0) == 0:
            return f
    b = d
    for _ in range(7):
        b = max(start + timedelta(days=1), b - timedelta(days=1))
        if all_dates.get(b, 0) == 0:
            return b
    return d

def _generate_milestones_for_assignment(a: Dict[str, Any], used: Dict[date, int], plan: Dict[str, Any]) -> None:
    t = (a.get("type") or "other").lower()
    names = MILESTONES_BY_TYPE.get(t) or ["Milestone 1", "Milestone 2"]
    if t not in MILESTONES_BY_TYPE:
        plan.setdefault("warnings", []).append({
            "assignment": a.get("title", ""),
            "message": f"Unknown type '{t}', using generic milestones"
        })

    # Accept due_date OR dueDate
    due_iso = a.get("due_date") or a.get("dueDate")
    if not due_iso:
        raise ValueError("assignment missing due date (need 'due_date' or 'dueDate')")
    due = _parse_date(due_iso)

    # Start date: prefer assignment.start_date, else plan.start_date, else today
    start_iso = a.get("start_date") or plan.get("start_date")
    start = _parse_date(start_iso) if start_iso else date.today()

    # If start is on/after due, pull it back to a window before due
    if start >= due:
        start = max(date.today(), due - timedelta(days=14))

    # Generate dates and resolve collisions across assignments
    days = _evenly_spaced_in_window(start, due, len(names))
    staggered: List[Dict[str, str]] = []
    for idx, d in enumerate(days):
        nd = _resolve_collisions(used, d, start, due)
        used[nd] = used.get(nd, 0) + 1
        staggered.append({"name": names[idx], "date": nd.isoformat()})
    a["milestones"] = staggered

    # Normalize both due_date keys for downstream code
    due_norm = due.isoformat()
    a["due_date"] = due_norm
    a["dueDate"]  = due_norm

def generate_milestones_for_plan(plan: Dict[str, Any]) -> Dict[str, Any]:
    assignments = plan.get("assignments", [])
    if not isinstance(assignments, list):
        raise ValueError("plan['assignments'] must be a list")
    used: Dict[date, int] = {}
    for a in assignments:
        _generate_milestones_for_assignment(a, used, plan)
    return plan
