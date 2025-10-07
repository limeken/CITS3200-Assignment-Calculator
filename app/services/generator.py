# app/services/generator.py
from __future__ import annotations
from datetime import date, timedelta
from typing import List, Dict, Any

MILESTONES_BY_TYPE: Dict[str, List[str]] = {
    "essay":        ["Research", "Outline", "Draft", "Revise", "Finalise"],
    "report":       ["Gather", "Analyse", "Draft", "Edit", "Finalise"],
    "lab":          ["Prep", "Experiment", "Analyse", "Writeup"],
    "presentation": ["Plan", "Draft", "Slides", "Rehearse", "Finalise"],
    "exam_prep":    ["Plan", "Study", "Practice", "Review"],
    "other":        ["Start", "Midpoint", "Finalise"],
}

def _evenly_spaced_in_window(start: date, due: date, count: int) -> List[date]:
    """
    Return `count` dates between [start, due-1], as even as possible.
    Assumes start < due. If the window is too tight, clamp into the window.
    """
    total = (due - start).days
    # We want milestones between start and due-1
    last_day = max(1, total - 1)
    out: List[date] = []
    for k in range(1, count + 1):
        # position in (0, last_day], evenly spaced
        pos = round(k * (last_day / (count + 1)))
        pos = max(1, min(last_day, pos))
        out.append(start + timedelta(days=pos))
    # ensure strictly increasing
    for i in range(1, len(out)):
        if out[i] <= out[i-1]:
            out[i] = min(due - timedelta(days=1), out[i-1] + timedelta(days=1))
    return out

def _resolve_collisions(all_dates: Dict[date, int], d: date, start: date, due: date) -> date:
    """
    If date `d` is already used, try shift +1 day toward due-1 a few times,
    then try backward. Keep within [start, due-1].
    """
    if all_dates.get(d, 0) == 0:
        return d
    # Try forward then backward up to a small radius
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
    return d  # give up; allow same day

def generate_milestones_for_plan(plan: Dict[str, Any]) -> Dict[str, Any]:
    """
    For each assignment in the plan, (re)generate milestones according to type.
    Mutates and returns the plan dict.
    """
    assignments = plan.get("assignments", [])
    # Track used dates across all assignments for simple staggering
    used: Dict[date, int] = {}

    for a in assignments:
        t = (a.get("type") or "other").lower()
        names = MILESTONES_BY_TYPE.get(t, MILESTONES_BY_TYPE["other"])
        start = date.fromisoformat(a["start_date"])
        due   = date.fromisoformat(a["due_date"])
        count = len(names)

        # Even spacing; ensure final milestone <= due-1
        days = _evenly_spaced_in_window(start, due, count)

        # Stagger to avoid collisions across assignments
        staggered: List[Dict[str, str]] = []
        for idx, d in enumerate(days):
            nd = _resolve_collisions(used, d, start, due)
            used[nd] = used.get(nd, 0) + 1
            staggered.append({"name": names[idx], "date": nd.isoformat()})

        a["milestones"] = staggered

    return plan
