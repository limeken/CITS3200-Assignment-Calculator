from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>UWA Assignment Planner</title>
  <script src=\"https://cdn.tailwindcss.com\"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['\\"Source Sans Pro\\"', 'Arial', 'sans-serif'],
            uwa: ['\\"UWA Regular\\"', 'UWA', 'Georgia', 'serif']
          },
          colors: {
            uwaBlue: '#27348B',
            uwaGold: '#E2B600',
            uwaGrey: '#ececec'
          },
          borderRadius: {
            'xl': '0.75rem'
          },
          boxShadow: {
            'soft': '0 8px 30px rgba(0,0,0,0.08)'
          }
        },
        formatDate(dateStr){
          if(!dateStr) return '';
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      }
    }
  </script>
  <link href=\"https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap\" rel=\"stylesheet\">
  <script defer src=\"https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js\"></script>
</head>
<body class=\"min-h-screen bg-gray-50 text-gray-900 font-sans\" x-data=\"plannerApp()\" x-init=\"init()\">

  <!-- Top Bar -->
  <header class=\"bg-uwaBlue text-white\">
    <div class=\"max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between\">
      <div class=\"flex items-center\">
        <button type=\"button\" class=\"focus:outline-none\">
          <img src=\"//static.weboffice.uwa.edu.au/visualid/core-rebrand/img/uwacrest/uwacrest-white.svg\" alt=\"UWA Crest\" class=\"h-20 w-auto\">
        </button>
      </div>
      <div class=\"flex items-center gap-4\">
        <button class=\"p-2 rounded-full hover:bg-white/10\" aria-label=\"Menu\">
          <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-7 h-7\"><path d=\"M4 6.75A.75.75 0 014.75 6h14.5a.75.75 0 010 1.5H4.75A.75.75 0 014 6.75zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H4.75A.75.75 0 014 12zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H4.75a.75.75 0 01-.75-.75z\"/></svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Grey Heading Bar -->
  <div class=\"bg-uwaGrey\">
    <div class=\"max-w-6xl mx-auto px-4 sm:px-6 py-6\">
      <h1 class=\"text-2xl font-bold text-uwaBlue text-left font-uwa\">Academic Skills Centre Assignment Date Calculator</h1>
    </div>
  </div>

  <!-- Instructions Button + Modal (wired up) -->
  <div class="max-w-6xl mx-auto px-4 sm:px-6 mt-4" x-data="{ open: false }">
    <button @click="open = true" class="bg-uwaBlue text-white px-4 py-2 rounded-xl shadow-soft font-semibold">Instructions</button>

    <!-- Overlay -->
    <div x-show="open" x-transition.opacity class="fixed inset-0 bg-black/50 z-40" @click="open = false" aria-hidden="true"></div>

    <!-- Modal -->
    <div x-show="open" x-transition class="fixed inset-0 z-50 grid place-items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="inst-title"
           class="bg-white rounded-xl shadow-soft max-w-lg w-full mx-4 p-6">
        <h2 id="inst-title" class="text-xl font-bold mb-4 text-uwaBlue">How to Use the Assignment Calculator</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-800">
          <li><strong>Purpose:</strong> Plan your assignment by breaking the work into manageable steps.</li>
          <li><strong>Assessment Type:</strong> Choose the variety of assignment (Essay, Coding Project, Lab Sheet, Presentation).</li>
          <li><strong>Dates:</strong> Pick your start date and due date.</li>
          <li><strong>Plan Settings:</strong> Set how many hours per day you’ll commit.</li>
          <li>Click <em>Generate Plan</em> to create your study timeline.</li>
        </ul>
        <div class="mt-6 text-right">
          <button @click="open = false" class="bg-uwaGold text-black px-4 py-2 rounded-xl font-semibold">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Controls -->
  <section class=\"max-w-6xl mx-auto px-4 sm:px-6 mt-6\">
    <div class=\"grid lg:grid-cols-3 gap-4\">
    <!-- Assessment Type -->
      <div class=\"bg-uwaGold text-gray-900 rounded-xl shadow-soft p-4\">
        <h2 class=\"text-lg font-semibold mb-3\">Assessment Type</h2>
        <select x-model=\"selectedType\" class=\"w-full rounded-xl px-4 py-3 bg-white/20\">
          <option>Essay</option>
          <option>Coding Project</option>
          <option>Lab Sheet</option>
          <option>Presentation</option>
        </select>
      </div>

      <!-- Dates -->
      <div class=\"bg-uwaGold text-gray-900 rounded-xl shadow-soft p-4\">
        <h2 class=\"text-lg font-semibold mb-3\">Dates</h2>
        <div class=\"grid sm:grid-cols-2 gap-3\">
          <label class=\"block\">
            <span class=\"text-sm font-medium\">Start date</span>
            <input type=\"date\" x-model=\"startDate\" class=\"mt-1 w-full rounded-xl bg-white/20 px-3 py-2\">
          </label>
          <label class=\"block\">
            <span class=\"text-sm font-medium\">Due date</span>
            <input type=\"date\" x-model=\"dueDate\" class=\"mt-1 w-full rounded-xl bg-white/20 px-3 py-2\">
          </label>
        </div>
      </div>

      <!-- Plan Settings -->
      <div class=\"bg-uwaGold text-gray-900 rounded-xl shadow-soft p-4\">
        <h2 class=\"text-lg font-semibold mb-3\">Plan Settings</h2>
        <label class=\"block\">
          <span class=\"text-sm font-medium\">Effort per day (hrs)</span>
          <input type=\"number\" x-model=\"hoursPerDay\" step=\"0.5\" min=\"0.5\" class=\"mt-1 w-full rounded-xl bg-white/20 px-3 py-2\">
        </label>
        <button @click=\"generate()\" class=\"mt-3 w-full rounded-xl bg-uwaBlue text-white font-semibold px-4 py-3\">Generate Plan</button>
      </div>
    </div>
  </section>

  <!-- Study Plan -->
  <section class=\"max-w-6xl mx-auto px-4 sm:px-6 mt-6\">
    <div class=\"bg-uwaGold rounded-xl shadow-soft p-4\">
      <h2 class=\"text-xl font-bold\">Study Plan</h2>
      <ol class=\"mt-4 space-y-2\">
        <template x-for=\"s in schedule\">
          <li class=\"bg-white/40 rounded-xl px-4 py-3 flex justify-between\">
            <span x-text=\"s.task\"></span>
            <span x-text=\"s.date\"></span>
          </li>
        </template>
      </ol>
    </div>
  </section>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(TEMPLATE)

if __name__ == '__main__':
    app.run(debug=True)

