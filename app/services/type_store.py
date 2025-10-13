import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

try:
    import yaml  # pip install pyyaml
except ImportError:  # pragma: no cover - tests fallback to json path
    yaml = None

_BASE_DIR = Path(__file__).resolve().parent.parent
_DEFAULT_TYPES_DIR = _BASE_DIR / "data" / "types"
TYPES_DIR = Path(os.environ.get("ASSIGNMENT_TYPES_DIR", _DEFAULT_TYPES_DIR))
METADATA_PATH = TYPES_DIR / "_metadata.json"
DEFAULT_ICON = "DocumentTextIcon"

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
    suffix = path.suffix.lower()
    if suffix in {".yaml", ".yml"}:
        if not yaml:
            try:
                return json.loads(text)
            except json.JSONDecodeError as exc:  # pragma: no cover - defensive fallback
                raise RuntimeError("PyYAML not installed — run `pip install pyyaml`") from exc
        return yaml.safe_load(text) or {}
    return json.loads(text)


def _slugify(raw: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", raw.strip().lower())
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "assignment"


def _refresh_cache() -> None:
    by_id: Dict[str, Dict[str, Any]] = {}
    if TYPES_DIR.exists():
        for f in TYPES_DIR.glob("*.*"):
            if f.name.startswith("_"):
                continue
            if f.suffix.lower() not in {".yaml", ".yml", ".json"}:
                continue
            doc = _load_file(f)
            tid = _slugify(doc.get("id") or f.stem)
            doc["id"] = tid
            doc.setdefault("icon", DEFAULT_ICON)
            by_id[tid] = doc
    _cache["by_id"] = by_id


def _ensure_fresh() -> None:
    mt = _dir_mtime(TYPES_DIR)
    if mt > _cache["mtime"]:
        _refresh_cache()
        _cache["mtime"] = mt


def list_types() -> Dict[str, Any]:
    _ensure_fresh()
    return _cache["by_id"]


def get_type(tid: str) -> Optional[Dict[str, Any]]:
    _ensure_fresh()
    return _cache["by_id"].get(_slugify(tid or ""))


def save_type(doc: Dict[str, Any]) -> Dict[str, Any]:
    TYPES_DIR.mkdir(parents=True, exist_ok=True)
    incoming = dict(doc)
    raw_id = incoming.get("id") or incoming.get("title") or "assignment"
    tid = _slugify(str(raw_id))
    incoming["id"] = tid
    incoming.setdefault("icon", DEFAULT_ICON)
    path = TYPES_DIR / f"{tid}.json"
    yaml_path = TYPES_DIR / f"{tid}.yaml"
    if yaml_path.exists():
        try:
            yaml_path.unlink()
        except Exception:
            pass
    path.write_text(json.dumps(incoming, indent=2, ensure_ascii=False), encoding="utf-8")
    _cache["mtime"] = 0.0
    _ensure_fresh()
    return _cache["by_id"][tid]


def delete_type(tid: str) -> bool:
    slug = _slugify(tid or "")
    ok = False
    if not TYPES_DIR.exists():
        return False
    for f in TYPES_DIR.glob(f"{slug}.*"):
        if f.suffix.lower() in {".yaml", ".yml", ".json"}:
            try:
                f.unlink()
                ok = True
            except Exception:
                pass
    if ok:
        _cache["mtime"] = 0.0
        _ensure_fresh()
    return ok


def get_metadata() -> Dict[str, Any]:
    if not METADATA_PATH.exists():
        return {}
    try:
        return json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def record_generated_at(timestamp: Optional[str] = None) -> Dict[str, Any]:
    TYPES_DIR.mkdir(parents=True, exist_ok=True)
    ts = timestamp or datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    payload = {"generated_at": ts}
    METADATA_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    _cache["mtime"] = 0.0
    return payload
