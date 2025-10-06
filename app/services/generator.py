from __future__ import annotations
from datetime import date, timedelta, datetime
from typing import List, Dict, Any

# Milestone templates by assignment type
MILESTONES_BY_TYPE: Dict[str, List[str]] = {
    "essay":        ["Research", "Outline", "Draft", "Revise", "Finalise"],
    "report":       ["Gather", "Analyse", "Draft", "Edit", "Finalise"],
    "lab":          ["Prep", "Experiment", "Analyse", "Writeup"],
    "presentation": ["Plan", "Draft", "Slides", "Rehearse", "Finalise"],
    "exam_prep":    ["Plan", "Study", "Practice", "Review"],
    "other":        ["Start", "Midpoint", "Finalise"],
}

def _iso_to_date(s: str) -> date:
    return datetime.fromisoformat(s).date()

def _evenly_spaced_in_window(start: date, due: date, count: int) -> List[date]:
    total = (due - start).days
    last_day = max(1, total - 1)
    out: List[date] = []
    for k in range(1, count + 1):
        pos = round(k * (last_day / (count + 1)))
        pos = max(1, min(last_day, pos))
        out.append(start + timedelta(days=pos))
    for i in range(1, len(out)):
        if out[i] <= out[i-1]:
            out[i] = min(due - timedelta(days=1), out[i-1] + timedelta(days=1))
    return out

def _resolve_collisions(all_dates: Dict[date, int], d: date, start: date, due: date) -> date:
    if all_dates.get(d, 0) == 0:
        return d
    forward = d
    for _ in range(7):
        forward = min(due - timedelta(days=1), forward + timedelta(days=1))
        if all_dates.get(forward, 0) == 0:
            return forward
    backward = d
    for _ in range(7):
        backward = max(start + timedelta(days=1), backward - timedelta(days=1))
        if all_dates.get(backward, 0) == 0:
            return backward
    return d

def _generate_milestones_for_assignment(a: Dict[str, Any], used: Dict[date, int]) -> None:
    t = (a.get("type") or "other").lower()
    names = MILESTONES_BY_TYPE.get(t, MILESTONES_BY_TYPE["other"])
    start = _iso_to_date(a["start_date"])
    due   = _iso_to_date(a["due_date"])
    count = len(names)

    days = _evenly_spaced_in_window(start, due, count)
    staggered: List[Dict[str, str]] = []
    for idx, d in enumerate(days):
        nd = _resolve_collisions(used, d, start, due)
        used[nd] = used.get(nd, 0) + 1
        staggered.append({"name": names[idx], "date": nd.isoformat()})
    a["milestones"] = staggered

def generate_milestones_for_plan(plan: Dict[str, Any]) -> None:

    """
    Thin wrapper for route usage. Mutates `plan` in-place.
    """
    assignments = plan.get("assignments", [])
    if not isinstance(assignments, list):
        raise ValueError("plan['assignments'] must be a list")
    used: Dict[date, int] = {}
    for a in assignments:
        if not a.get("start_date") or not a.get("due_date"):
            raise ValueError("assignment missing start_date or due_date")
        _generate_milestones_for_assignment(a, used)