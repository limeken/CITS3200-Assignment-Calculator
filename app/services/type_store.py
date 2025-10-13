import os, json
from pathlib import Path
from typing import Dict, Any

try:
    import yaml  # pip install pyyaml
except ImportError:
    yaml = None

TYPES_DIR = Path(os.environ.get("ASSIGNMENT_TYPES_DIR", "data/types"))
_cache: Dict[str, Any] = {"by_id": {}, "mtime": 0.0}

def _dir_mtime(path: Path) -> float:
    mt = path.stat().st_mtime if path.exists() else 0.0
    for f in path.glob("*"):
        try:
            mt = max(mt, f.stat().st_mtime)
        except Exception:
            pass
    return mt

def _load_file(path: Path) -> Dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() in (".yaml", ".yml"):
        if not yaml:
            raise RuntimeError("PyYAML not installed — run `pip install pyyaml`")
        return yaml.safe_load(text) or {}
    return json.loads(text)

def _refresh_cache():
    by_id = {}
    if TYPES_DIR.exists():
        for f in TYPES_DIR.glob("*.*"):
            if f.suffix.lower() not in (".yaml", ".yml", ".json"):
                continue
            doc = _load_file(f)
            tid = (doc.get("id") or f.stem).strip().lower()
            doc["id"] = tid
            by_id[tid] = doc
    _cache["by_id"] = by_id

def _ensure_fresh():
    mt = _dir_mtime(TYPES_DIR)
    if mt > _cache["mtime"]:
        _refresh_cache()
        _cache["mtime"] = mt

def list_types() -> Dict[str, Any]:
    _ensure_fresh()
    return _cache["by_id"]

def get_type(tid: str) -> Dict[str, Any] | None:
    _ensure_fresh()
    return _cache["by_id"].get((tid or "").lower())

def save_type(doc: Dict[str, Any]) -> Dict[str, Any]:
    TYPES_DIR.mkdir(parents=True, exist_ok=True)
    tid = (doc.get("id") or doc.get("title") or "custom").strip().lower().replace(" ", "_")
    doc["id"] = tid
    path = TYPES_DIR / f"{tid}.yaml"
    if yaml:
        path.write_text(yaml.safe_dump(doc, sort_keys=False, allow_unicode=True), encoding="utf-8")
    else:
        path.write_text(json.dumps(doc, indent=2, ensure_ascii=False), encoding="utf-8")
    _cache["mtime"] = 0
    _ensure_fresh()
    return get_type(tid)

def delete_type(tid: str) -> bool:
    tid = (tid or "").lower()
    ok = False
    for f in TYPES_DIR.glob(f"{tid}.*"):
        if f.suffix.lower() in (".yaml", ".yml", ".json"):
            try:
                f.unlink()
                ok = True
            except Exception:
                pass
    _cache["mtime"] = 0
    _ensure_fresh()
    return ok
