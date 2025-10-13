# Backend Routes

This document describes the REST API surface exposed by the Flask backend, grouped by blueprint. It also notes features that are not yet implemented.

## Summary Table

| Blueprint | Endpoint | Methods | Purpose |
|-----------|----------|---------|---------|
| `health` | `/healthz` | `GET` | Simple heartbeat with version metadata. |
| `plan` | `/plan/` | `POST` | Create a new study plan in the in-memory store. |
| `plan` | `/plan/<plan_id>/generate` | `GET`, `POST` | Generate milestones for a stored plan. |
| `export` | `/export/<plan_id>.pdf` | `GET` | Render a plan as a downloadable PDF. |
| `export` | `/export/<plan_id>.ics` | `GET` | Render a plan as an iCalendar file. |
| `export` | `/export/metrics` | `GET` | Expose per-route and export counters. |
| `types` | `/types` | `GET` | List all assignment types with summary information. |
| `types` | `/types/<type_id>` | `GET` | Fetch the full definition of a single assignment type. |
| `types` | `/types` | `POST` | Persist a new assignment type definition. |
| `types` | `/types/<type_id>` | `PUT` | Replace an existing assignment type definition. |
| `types` | `/types/<type_id>` | `DELETE` | Remove an assignment type definition. |
| `semesters` | `/semesters` | `GET` | List all known semesters with start/end dates. |
| `semesters` | `/semesters/<semester_id>` | `GET` | Return a single semester record. |
| `semesters` | `/semesters` | `POST` | Create or overwrite a semester definition. |
| `semesters` | `/semesters/<semester_id>` | `DELETE` | Delete a semester definition. |
| `admin` | `/admin` | `GET` | Serve the web UI for managing assignment types. |

## Blueprint Details

### Health (`app/routes/health.py`)
- **`GET /healthz`** returns `{ "status": "ok", "version": <app version> }` and is typically probed by monitoring or deployment tooling.

### Plan (`app/routes/plan.py`)
- **`POST /plan/`** accepts a plan payload with `title`, `start_date`, and an `assignments` array. Each assignment must specify `unit`, `title`, `type`, `estimated_hours`, and a `due_date`. The route normalises assignments, generates a UUID for the plan, stores it in `current_app.config['PLANS']`, and returns the created plan document.
- **`GET|POST /plan/<plan_id>/generate`** reloads the stored plan, calls `generate_milestones_for_plan` to create milestone entries, and increments a global `METRICS['generated']` counter. A 404 is raised if the plan ID is unknown, and a 400 is raised if milestone generation fails.

### Export (`app/routes/export.py`)
- **`GET /export/<plan_id>.pdf`** builds a PDF for the referenced plan via `services.pdf.build_plan_pdf`, increments `METRICS['exports']['pdf']`, and streams the file back to the client. Responds with 404 when the plan is missing.
- **`GET /export/<plan_id>.ics`** mirrors the PDF route but uses `services.ics.build_plan_ics` to produce an iCalendar file and increments the ICS export counter.
- **`GET /export/metrics`** exposes the in-memory `METRICS` structure, including per-route hit counts, export tallies, and plan generation count. Request counts are updated by a `before_request` hook registered during app setup.

### Assignment Types (`app/routes/types.py`)
- **`GET /types`** returns a lightweight list of all persisted assignment types, showing each type's ID, display title, and number of milestones. Data is read through `services.type_store.list_types`, which scans `data/types`.
- **`GET /types/<type_id>`** returns the full JSON (or YAML) definition for a single assignment type. Responds with 404 if the ID is unknown.
- **`POST /types`** validates that the request body includes a non-empty `milestones` array, then saves the type via `type_store.save_type`. The saved record is returned with HTTP 201.
- **`PUT /types/<type_id>`** replaces the stored definition for the supplied ID. The route enforces the presence of the `milestones` array and writes the document back to disk.
- **`DELETE /types/<type_id>`** removes a persisted type file. It returns 204 on success or 404 if the type was not present.

### Semesters (`app/routes/semesters.py`)
- **`GET /semesters`** returns an array of semester documents, each containing `id`, `name`, `start_date`, `end_date`, and optional `detail`. Data is sourced from YAML/JSON files under `data/semesters` via `services.semester_store`.
- **`GET /semesters/<semester_id>`** fetches a single semester. Responds with 404 if the ID is unknown.
- **`POST /semesters`** upserts a semester definition. The body must include `name`, `start_date`, and `end_date` (ISO dates). When provided, `detail` is persisted alongside.
- **`DELETE /semesters/<semester_id>`** removes semester data files. Returns 204 on success and 404 if the semester is missing.

### Admin (`app/routes/admin.py`)
- **`GET /admin`** renders an HTML admin panel that interacts with the `/types` API to create, edit, and delete assignment types. This is primarily for human operators.
- **`GET /admin/types`** redirects to `/admin` for backwards compatibility.
