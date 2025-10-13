# CITS3200 Assignment Calculator
CITS3200 Semester 2 2025. Team 48 Academic Skills Centre Assignment Date Calculator revamp.

## Frontend Setup
The frontend is built off of the vite template `react-ts`.
[Before you get started testing the frontend, ensure you have **Node.js/npm** installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
### Testing the Frontend
1. Navigate to the project directory
> `$ cd .../CITS3200-Assignment-Calculator/AssignmentCalculator`
2. Install the required packages
> `$ npm install `
3. Run the server in development mode
> `$ npm run dev`

## Assignment Type Cache
Run `npm run build-cache` from `AssignmentCalculator/` (or `python3 scripts/build_assignment_cache.py` from the repo root) whenever you change files in `app/data/types/`. This regenerates the frontend cache module, updates `app/data/types/_metadata.json`, and keeps the backend freshness endpoint (`GET /types/metadata`) in sync.

