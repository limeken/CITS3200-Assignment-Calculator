from datetime import date, timedelta

def generate_milestones(assignment):
    # TODO: implement real rules later
    # For now, return the same assignment with a single midpoint milestone
    start = date.fromisoformat(assignment["start_date"])
    due = date.fromisoformat(assignment["due_date"])
    mid = start + (due - start) // 2
    milestones = [{"name": "Midpoint", "date": mid.isoformat()}]
    out = dict(assignment)
    out["milestones"] = milestones
    return out
