# Notes Frontend (Ocean Professional)

A modern, responsive single‑page notes manager built with React. It features a header, a sidebar for the notes list, and a main editor/view panel. Data is stored in localStorage for now. Environment variables are read to prepare for future backend integration.

## Quick Start

- Install: `npm install`
- Run dev server: `npm start`
  - App runs at http://localhost:3000

## Features

- Responsive layout: header, sidebar, main editor
- Create, edit, delete notes in‑memory with localStorage persistence
- Ocean Professional theme:
  - primary #2563EB, secondary/success #F59E0B, error #EF4444
  - background #f9fafb, surface #ffffff, text #111827
  - subtle gradients, shadows, rounded corners, smooth transitions
- Env‑based configuration stubs (no backend calls yet)
- Optional experiments UI via feature flags

## Environment Variables

Define these in a `.env` file at the project root (see `.env.example`):

- REACT_APP_API_BASE: Base URL for future backend API. If set, the app logs intended endpoints.
- REACT_APP_FEATURE_FLAGS: JSON array, e.g. `["experiments"]`
- REACT_APP_EXPERIMENTS_ENABLED: "true" to enable experiments related UI

Additional container vars recognized by the environment but not explicitly used here yet:
REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH

## Accessibility

- Buttons and inputs include descriptive aria‑labels.
- Keyboard focus states are visible.
- Landmarks: header (role=banner), nav (aria-label), main (role=main), footer (role=contentinfo).

## Project Structure

- `src/App.js`: App shell, components (Header, NotesList, NoteItem, NoteEditor), state and CRUD
- `src/App.css`: Theme variables and styles
- `src/index.js`: App entrypoint

## Notes Storage

- Stored under `localStorage` key: `notes_app_items_v1`
- Initial mock note created when no notes exist

## Future Integration

When a backend is available, use `process.env.REACT_APP_API_BASE` and replace the localStorage layer with fetch calls to:
- GET `${REACT_APP_API_BASE}/notes`
- POST `${REACT_APP_API_BASE}/notes`
- PUT `${REACT_APP_API_BASE}/notes/:id`
- DELETE `${REACT_APP_API_BASE}/notes/:id`

No changes are required to the UI to enable this swap.
