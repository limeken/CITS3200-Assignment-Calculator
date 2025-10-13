import os
import shutil
from pathlib import Path

import pytest

from app import create_app


@pytest.fixture(autouse=True)
def assignment_types_dir(tmp_path, monkeypatch):
    src = Path(__file__).resolve().parent.parent / "data" / "types"
    dest = tmp_path / "types"
    dest.mkdir(parents=True, exist_ok=True)
    if src.exists():
        for item in src.glob("*.*"):
            if item.is_file():
                shutil.copy(item, dest / item.name)
    monkeypatch.setenv("ASSIGNMENT_TYPES_DIR", str(dest))
    yield dest


@pytest.fixture()
def app():
    app = create_app()
    app.config.update(TESTING=True)
    return app
