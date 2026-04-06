# Rubber-Stamp 🖋️

An interactive browser-based drawing game where you design playing cards by stamping artwork onto a canvas. An AI model (OpenAI GPT-4o) generates custom rubber-stamp SVGs on demand, which you can preview, save to your personal library, or discard.

---

## Features

| Feature | Details |
|---|---|
| **Playing-card canvas** | Proportionally correct 2.5 × 3.5″ card, drag-resizable in the browser |
| **Stamp library** | 15 built-in stamps across shapes, playing-card suits, symbols, and nature |
| **Stamp placement** | Click-to-stamp, drag to reposition, handles to resize/rotate |
| **Tint & opacity** | Per-session colour tint and opacity sliders |
| **Background colour** | Full colour picker for the card background |
| **Undo (50 levels)** | Ctrl/⌘+Z or the toolbar button |
| **Erase mode** | Click any placed stamp to remove it |
| **AI stamp generator** | Describe a stamp in plain text → GPT-4o returns a clean SVG |
| **Stamp review flow** | Generated stamps sit in a pending queue; Save or Discard each one |
| **Export** | Export the card as a high-resolution PNG (3× pixel ratio) |
| **Persistent storage** | Library and current design persist across reloads via `localStorage` |

---

## Tech Stack

```
client/          Vite + React 19 + TypeScript
  react-konva    Canvas rendering and interaction (Konva.js)
  zustand        Global state management (persisted)
  tailwindcss    Utility-first styling
  react-colorful Lightweight colour pickers

server/          Express + TypeScript (tsx for dev, tsc for prod)
  openai         OpenAI Node SDK (GPT-4o SVG generation)
  zod            Request validation
  dotenv         Environment variable loading
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- An OpenAI API key (for AI stamp generation)

### 1. Clone & install

```bash
git clone <repo-url>
cd rubber-stamp
npm install          # installs root + both workspaces
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
# edit server/.env and paste your OPENAI_API_KEY
```

### 3. Start development servers

```bash
npm run dev          # starts both client (port 5173) and server (port 3001)
```

Open [http://localhost:5173](http://localhost:5173).

The Vite dev server proxies all `/api` requests to the Express server, so CORS is never an issue during development.

### 4. Production build

```bash
npm run build        # builds client → client/dist, server → server/dist
npm start            # runs the compiled server; serve client/dist with any static host
```

---

## How to Play

1. **Pick a stamp** from the left sidebar (click it to make it the active stamp).
2. **Click on the card** to place the stamp at that position.
3. **Switch to Select mode** (`V` or toolbar) to drag, resize, and rotate placed stamps.
4. **Adjust tint, size, and opacity** in the toolbar before or after placing.
5. **Change the card background** using the BG colour swatch.
6. **Generate AI stamps** — expand the ✨ panel, type a description, choose a style, and click Generate. Preview the result, then Save it to your library or Discard it.
7. **Export** the finished card as a PNG with the Export button.

### Keyboard shortcuts

| Key | Action |
|---|---|
| `S` | Stamp mode |
| `V` | Select mode |
| `E` | Erase mode |
| `Esc` | Deselect / cancel |
| `Ctrl/⌘ Z` | Undo |

---

## Project Structure

```
rubber-stamp/
├── client/
│   └── src/
│       ├── components/
│       │   ├── App.tsx            # Root layout + keyboard shortcuts
│       │   ├── CardCanvas.tsx     # Konva stage – card + stamp rendering
│       │   ├── StampLibrary.tsx   # Left sidebar with stamp grid
│       │   ├── AiGenerator.tsx    # AI generator panel + pending review
│       │   └── Toolbar.tsx        # Top toolbar – tools, colours, export
│       ├── store/
│       │   └── useAppStore.ts     # Zustand store (persisted)
│       ├── types/
│       │   └── index.ts           # Shared TypeScript types
│       └── utils/
│           └── defaultStamps.ts   # 15 built-in SVG stamps
└── server/
    └── src/
        ├── index.ts               # Express app entry point
        └── routes/
            └── generateStamp.ts   # POST /api/generate-stamp
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | **Required** for AI stamp generation |
| `PORT` | `3001` | Express server port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

---

## Extending the App

- **More default stamps** — add entries to `client/src/utils/defaultStamps.ts`
- **Stamp categories** — stamps are grouped automatically by their `category` field
- **Multiple card designs** — the store is ready for a `savedDesigns` array; add a save/load UI
- **Different AI models** — swap `gpt-4o` in `server/src/routes/generateStamp.ts` for any other model that can produce SVG
- **Multiplayer / sharing** — the design is serialisable JSON; add a backend endpoint to persist and share card URLs
