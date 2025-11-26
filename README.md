# PromptBuilder Web

PromptBuilder Web is a browser-based playground for assembling high-quality AI prompts with your own files. It speaks to the OpenRouter API, helps you curate context, estimates tokens/cost, and can even turn XML-style AI responses into ready-to-run patches.

## Features
- Drag-and-drop file/folder ingestion with tree view, previews, and syntax highlighting
- Prompt composer with templates (code review, feature, bug fix, XML patch) plus token and cost estimation
- Model picker/refresh for OpenRouter models, with saved preferences and streaming responses
- AI response workspace with copy, manual paste, and XML patch parsing that generates git-apply commands
- Project save/load to `.json`, prompt export, and keyboard shortcuts for common actions
- Light/dark/auto themes, context builder to suggest relevant files, and live folder linking via the File System Access API

## Getting Started

### Prerequisites
- An OpenRouter API key (kept in your browser’s local storage)
- A modern Chromium-based browser (for streaming and the File System Access API)

### Run locally
1. Serve the repository as a static site from its root (any port is fine), e.g.:
   ```bash
   python3 -m http.server 5173
   ```
   or `npx serve .`
2. Open the served URL (e.g., `http://localhost:5173`) in your browser.

> Opening `index.html` directly from the filesystem may block APIs like fetch or the File System Access API; use a local server.

## Usage
1. Open **Settings** and paste your OpenRouter API key. Adjust max tokens, temperature, and streaming if desired.
2. Add context:
   - Drag files/folders into the upload zone, or browse to select them.
   - Optionally link a live folder (reads fresh contents at prompt time).
   - Use **Select All/Clear** to manage the selection and the tree to preview files.
3. Choose a prompt template (or keep custom), describe the task, and click **Generate Prompt**. Token and cost estimates update automatically.
4. Pick a model from the dropdown (refresh to pull the latest list) and click **Send to AI** to stream the response.
5. Manage responses:
   - Copy the response or paste one manually.
   - If the response includes an XML `<changes>` block, the app extracts edits, shows a summary, and provides a git patch command plus download/apply helpers.
6. Save or reload a project (`.json`), or export just the generated prompt (`.txt`).

## Project Structure
- `index.html` – App layout, panels, modals, and tabbed workspace
- `style.css` – Visual styling, ASCII-inspired theme, and responsive layout
- `app.js` – State management, model loading, prompt generation, streaming, XML patch parsing, keyboard shortcuts, theming, and project persistence
- `LICENSE` – Project license

## Development Notes
- No build step is required; everything runs as a static site.
- Settings (API key, model choice, preferences) persist in `localStorage`/`sessionStorage`.
- Contributions: follow gitflow-style branches for new features before opening a PR.

