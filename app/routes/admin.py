from flask import Blueprint, render_template_string

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Assignment Type Manager | UWA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: "Source Sans Pro", Arial, sans-serif; background: #f9fafb; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem; }
    .btn { border-radius: 6px; padding: 0.4rem 0.9rem; font-weight: 500; transition: 0.2s; }
    .btn-blue { background: #27348B; color: white; }
    .btn-blue:hover { background: #1f2d73; }
    .btn-red { background: #dc2626; color: white; }
    .btn-red:hover { background: #b91c1c; }
    .btn-gray { background: #e5e7eb; color: #111827; }
    .modal { background: rgba(0,0,0,0.4); display:none; align-items:center; justify-content:center; position:fixed; inset:0; z-index:50; }
    .modal.open { display:flex; }
    .modal-content { background:white; padding:1.5rem; border-radius:0.75rem; width:480px; max-height:90vh; overflow:auto; box-shadow:0 10px 25px rgba(0,0,0,0.15); }
    table { width:100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 13px; }
    th, td { border: 1px solid #e5e7eb; padding: 6px; text-align:left; }
    th { background:#f3f4f6; }
  </style>
</head>
<body class="min-h-screen bg-gray-50 text-gray-900">

  <!-- UWA Banner -->
  <header class="fixed w-full h-40 top-0 right-0 z-50 bg-[#27348B] text-white">
    <div class="h-3/5 mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
      <a href="/" aria-label="UWA Home">
        <img
          src="http://static.weboffice.uwa.edu.au/visualid/core-rebrand/img/uwacrest/uwacrest-white.svg"
          alt="UWA Crest"
          class="h-20 w-auto"
        />
      </a>
    </div>
    <div class="flex items-center justify-between w-full h-2/5 bg-[#ececec]">
      <div class="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4">
        <h1 class="text-2xl font-bold text-[#27348B] font-[Georgia,serif]">
          Academic Skills Centre Assignment Type Manager
        </h1>
      </div>
    </div>
  </header>

  <main class="pt-48 pb-16 mx-auto w-full max-w-6xl px-4 sm:px-6">
    <div class="flex justify-between mb-6">
      <input id="search" placeholder="Search types..." class="border border-gray-300 rounded-md p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-[#27348B]">
      <button id="btn-add" class="btn btn-blue">➕ Add New Type</button>
    </div>

    <div id="types-container" class="grid gap-4"></div>
  </main>

  <!-- Modal -->
  <div id="modal" class="modal">
    <div class="modal-content">
      <h2 class="text-lg font-semibold mb-3 text-[#27348B]" id="modal-title">Add Type</h2>
      <form id="type-form">
        <label class="block mb-2 font-medium">ID</label>
        <input id="type-id" required placeholder="e.g. report" class="mb-3 border-gray-300 rounded-md">

        <label class="block mb-2 font-medium">Title</label>
        <input id="type-title" required placeholder="e.g. Report" class="mb-3 border-gray-300 rounded-md">

        <label class="block mb-2 font-medium">Milestones</label>
        <table id="milestone-table">
          <thead><tr><th>Name</th><th>Offset (days)</th><th></th></tr></thead>
          <tbody id="milestone-body"></tbody>
        </table>
        <button type="button" id="btn-add-milestone" class="btn btn-gray mt-2">➕ Add Milestone</button>

        <!-- Custom due date for preview -->
        <div class="mt-5">
          <label class="block font-medium mb-1">Preview due date:</label>
          <input type="date" id="preview-date" class="border border-gray-300 rounded-md p-2 w-full mb-2" />
        </div>

        <div id="preview" class="mt-4 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 hidden"></div>

        <div class="mt-6 flex justify-end gap-2">
          <button type="button" id="btn-cancel" class="btn btn-gray">Cancel</button>
          <button type="submit" class="btn btn-blue">Save</button>
        </div>
      </form>
    </div>
  </div>

  <script>
  const container = document.getElementById("types-container");
  const modal = document.getElementById("modal");
  const form = document.getElementById("type-form");
  const body = document.getElementById("milestone-body");
  const preview = document.getElementById("preview");
  const previewDate = document.getElementById("preview-date");
  let editId = null;

  async function fetchTypes() {
    const res = await fetch("/types");
    const data = await res.json();
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const filtered = data.filter(t => t.id.includes(searchTerm) || (t.title||"").toLowerCase().includes(searchTerm));
    container.innerHTML = filtered.map(t => `
      <div class="card flex justify-between items-center">
        <div>
          <h2 class="font-semibold text-lg text-[#27348B]">${t.title}</h2>
          <p class="text-gray-500 text-sm">ID: ${t.id} • ${t.milestone_count} milestones</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-blue" onclick="editType('${t.id}')">Edit</button>
          <button class="btn btn-red" onclick="deleteType('${t.id}')">Delete</button>
        </div>
      </div>`).join("");
  }

  document.getElementById("search").addEventListener("input", fetchTypes);

  async function editType(id) {
    const res = await fetch(`/types/${id}`);
    const data = await res.json();
    editId = id;
    document.getElementById("type-id").value = data.id;
    document.getElementById("type-title").value = data.title || "";
    body.innerHTML = "";
    (data.milestones || []).forEach(addMilestoneRow);
    modal.classList.add("open");
    updatePreview();
  }

  async function deleteType(id) {
    if (!confirm("Delete this type?")) return;
    await fetch(`/types/${id}`, { method: "DELETE" });
    fetchTypes();
  }

  function addMilestoneRow(m = {name:"", offset_days:-7}) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input value="${m.name}" placeholder="Name" class="border border-gray-300 rounded-md p-1 w-full"></td>
      <td><input type="number" value="${m.offset_days}" class="border border-gray-300 rounded-md p-1 w-24"></td>
      <td><button class="btn btn-red text-xs" onclick="this.closest('tr').remove(); updatePreview();">✖</button></td>
    `;
    body.appendChild(row);
    updatePreview();
  }

  document.getElementById("btn-add-milestone").onclick = () => addMilestoneRow();

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("type-id").value.trim();
    const titleVal = document.getElementById("type-title").value.trim();
    const milestones = Array.from(body.querySelectorAll("tr")).map(tr => {
      const [name, off] = tr.querySelectorAll("input");
      return { name: name.value.trim(), offset_days: parseInt(off.value||"-1") };
    }).filter(m => m.name);

    if (!milestones.length) { alert("Add at least one milestone."); return; }

    const bodyData = JSON.stringify({ id, title: titleVal, milestones });
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/types/${id}` : "/types";
    await fetch(url, { method, headers: {"Content-Type":"application/json"}, body: bodyData });
    modal.classList.remove("open");
    editId = null;
    fetchTypes();
  });

  document.getElementById("btn-add").onclick = () => {
    editId = null;
    form.reset();
    body.innerHTML = "";
    addMilestoneRow();
    modal.classList.add("open");
    updatePreview();
  };
  document.getElementById("btn-cancel").onclick = () => modal.classList.remove("open");

  // --- Live Preview ---
  function updatePreview() {
    const rows = Array.from(body.querySelectorAll("tr"));
    if (!rows.length) { preview.classList.add("hidden"); return; }
    const base = previewDate.value ? new Date(previewDate.value) : new Date();
    const list = rows.map(tr => {
      const [name, off] = tr.querySelectorAll("input");
      const date = new Date(base);
      date.setDate(base.getDate() + parseInt(off.value||0));
      const fmt = date.toISOString().slice(0,10);
      return `<li><b>${name.value}</b> — ${off.value} days → <span class='text-gray-500'>${fmt}</span></li>`;
    }).join("");
    preview.innerHTML = `<p class='font-semibold mb-1 text-[#27348B]'>📅 Preview (due ${base.toISOString().slice(0,10)})</p><ul class='list-disc pl-5'>${list}</ul>`;
    preview.classList.remove("hidden");
  }

  body.addEventListener("input", updatePreview);
  previewDate.addEventListener("input", updatePreview);
  fetchTypes();
  </script>
</body>
</html>
"""

@admin_bp.route("/types")
def admin_types():
    return render_template_string(HTML_TEMPLATE)
