from __future__ import annotations

from typing import Any

VALID_ICON = "DocumentTextIcon"


def test_list_types(client):
    resp = client.get("/types")
    assert resp.status_code == 200
    payload = resp.get_json()
    assert isinstance(payload, list)
    assert payload
    first = payload[0]
    assert {"id", "title", "milestone_count"}.issubset(first.keys())


def test_get_one(client):
    resp = client.get("/types/essay")
    assert resp.status_code == 200
    payload = resp.get_json()
    assert payload["id"] == "essay"
    assert isinstance(payload["milestones"], list)
    assert payload["milestones"], "milestones should not be empty"
    assert payload.get("icon")


def test_metadata_endpoint(client):
    resp = client.get("/types/metadata")
    assert resp.status_code == 200
    payload = resp.get_json()
    assert "generated_at" in payload


def test_create_validation_errors(client):
    resp = client.post("/types", json={"title": "Test"})
    assert resp.status_code == 400
    payload = resp.get_json()
    assert payload["error"] == "Bad Request"

    resp = client.post(
        "/types",
        json={
            "title": "Another",
            "milestones": [
                {"name": "", "effort_percent": "two"},
            ],
        },
    )
    assert resp.status_code == 400

    resp = client.post(
        "/types",
        json={
            "title": "Bad Icon",
            "icon": "NotARealIcon",
            "milestones": [
                {"name": "Plan", "effort_percent": 50},
                {"name": "Deliver", "effort_percent": 50},
            ],
        },
    )
    assert resp.status_code == 400


def _sample_payload(title: str = "Capstone") -> dict[str, Any]:
    return {
        "title": title,
        "description": "Sample description",
        "icon": VALID_ICON,
        "milestones": [
            {"name": "Kickoff", "effort_percent": 40},
            {"name": "Submit", "effort_percent": 60},
        ],
    }


def test_create_update_delete_flow(client):
    create = client.post("/types", json=_sample_payload())
    assert create.status_code == 201
    created = create.get_json()
    tid = created["id"]

    update = client.put(f"/types/{tid}", json=_sample_payload("Capstone v2"))
    assert update.status_code == 200
    updated = update.get_json()
    assert updated["title"] == "Capstone v2"

    delete = client.delete(f"/types/{tid}")
    assert delete.status_code == 204

    missing = client.get(f"/types/{tid}")
    assert missing.status_code == 404
