def test_assignment_crud(client):
    r = client.post("/plan", json={"assignments":[{"id":"a1","unit":"CITS3200","title":"R","due_date":"2025-10-20"}]})
    pid = r.get_json()["plan_id"]

    # edit
    r = client.patch(f"/plan/{pid}/assignments/a1", json={"title":"Report"})
    assert r.status_code == 200
    # delete
    r = client.delete(f"/plan/{pid}/assignments/a1")
    assert r.status_code == 204
