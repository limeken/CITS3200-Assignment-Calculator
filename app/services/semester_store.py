import os
import json
from pathlib import Path
from typing import Any, Dict, List
from datetime import datetime

try:
    import yaml  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    yaml = None

SEMESTERS_DIR = Path(os.environ.get("SEMESTERS_DIR", "data/semesters"))
_cache: Dict[str, Any] = {"items": [], "mtime": 0.0}


def _dir_mtime(path: Path) -> float:
    mt = path.stat().st_mtime if path.exists() else 0.0
    for child in path.glob("*"):
        try:
            mt = max(mt, child.stat().st_mtime)
        except OSError:
            continue
    return mt


def _load_file(path: Path) -> Dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() in {".yaml", ".yml"}:
        if not yaml:
            raise RuntimeError("PyYAML not installed — run `pip install pyyaml`")
        return yaml.safe_load(text) or {}
    return json.loads(text)


def _dump_file(path: Path, payload: Dict[str, Any]) -> None:
    if path.suffix.lower() in {".yaml", ".yml"} and yaml:
        path.write_text(
            yaml.safe_dump(payload, sort_keys=False, allow_unicode=True),
            encoding="utf-8",
        )
    else:
        path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )


def _slugify(value: str) -> str:
    cleaned = "".join(ch.lower() if ch.isalnum() else "-" for ch in value.strip())
    while "--" in cleaned:
        cleaned = cleaned.replace("--", "-")
    return cleaned.strip("-") or "semester"


def _refresh_cache() -> None:
    items: List[Dict[str, Any]] = []
    if SEMESTERS_DIR.exists():
        for file in SEMESTERS_DIR.glob("*.*"):
            if file.suffix.lower() not in {".yaml", ".yml", ".json"}:
                continue
            try:
                payload = _load_file(file)
            except Exception:
                continue
            sid = (payload.get("id") or file.stem).strip()
            payload["id"] = sid
            items.append(payload)
    items.sort(key=lambda item: item.get("start_date") or "")
    _cache["items"] = items


def _ensure_fresh() -> None:
    mt = _dir_mtime(SEMESTERS_DIR)
    if mt > _cache["mtime"]:
        _refresh_cache()
        _cache["mtime"] = mt


def list_semesters() -> List[Dict[str, Any]]:
    _ensure_fresh()
    return list(_cache.get("items", []))


def get_semester(sid: str) -> Dict[str, Any] | None:
    _ensure_fresh()
    for item in _cache.get("items", []):
        if item.get("id") == sid:
            return item
    return None


def save_semester(doc: Dict[str, Any]) -> Dict[str, Any]:
    SEMESTERS_DIR.mkdir(parents=True, exist_ok=True)
    name = (doc.get("name") or "").strip()
    start_date = (doc.get("start_date") or "").strip()
    end_date = (doc.get("end_date") or "").strip()
    detail = (doc.get("detail") or "").strip()

    if not start_date or not end_date or not name:
        raise ValueError("name, start_date, and end_date are required")

    # Validate ISO format
    for label, value in (("start_date", start_date), ("end_date", end_date)):
        try:
            datetime.fromisoformat(value)
        except ValueError as exc:  # pragma: no cover - simple validation
            raise ValueError(f"{label} must be ISO formatted (YYYY-MM-DD)") from exc

    sid = (doc.get("id") or _slugify(name) or start_date).lower()
    path = SEMESTERS_DIR / f"{sid}.yaml"

    payload = {
        "id": sid,
        "name": name,
        "start_date": start_date,
        "end_date": end_date,
    }
    if detail:
        payload["detail"] = detail

    _dump_file(path, payload)
    _cache["mtime"] = 0
    _ensure_fresh()
    return get_semester(sid) or payload


def delete_semester(sid: str) -> bool:
    sid = sid.strip().lower()
    ok = False
    for file in SEMESTERS_DIR.glob(f"{sid}.*"):
        if file.suffix.lower() in {".yaml", ".yml", ".json"}:
            try:
                file.unlink()
                ok = True
            except OSError:
                continue
    if ok:
        _cache["mtime"] = 0
        _ensure_fresh()
    return ok
