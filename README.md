# FluxFlow

A minimal, dark-themed project management app built for speed. Three panels — kanban board, quick tasks, and a notes scratchpad — all in one view. No backend, no accounts, no bloat. Your data lives in localStorage.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

**Kanban Board**
- Drag-and-drop cards between columns (To Do, In Progress, Complete)
- Inline card creation — no modal interruption
- Click any card to edit title, description, status, priority, and due date
- Quick-move arrows on hover to shift cards between columns
- Priority levels (None, Low, Medium, High, Urgent) with colored dots
- Due date tracking with overdue/today/tomorrow indicators
- Filter by priority, sort by priority, search across all cards

**Quick Tasks**
- Fast checkbox-based todo list
- Add tasks with Enter, check them off, clear completed in one click
- Satisfying check animation

**Notes Scratchpad**
- Freeform textarea with auto-save (500ms debounce)
- Character count display

**Design**
- Dark mode with amber accent palette
- JetBrains Mono + IBM Plex Sans font pairing
- Subtle grain texture overlay, dot-grid backgrounds
- Smooth animations: card hover lift, drag overlay rotation, staggered fade-ins
- Empty states with contextual copy

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/) (core + sortable)
- **Storage**: localStorage (no backend required)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/soozsteele/FluxFlow.git
cd FluxFlow

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
FluxFlow/
├── app/
│   ├── globals.css         # Design system, animations, CSS variables
│   ├── layout.tsx          # Root layout with fonts
│   └── page.tsx            # Three-panel grid shell
├── components/
│   ├── KanbanBoard.tsx     # DndContext, filters, search, sort
│   ├── KanbanColumn.tsx    # Droppable column with inline create
│   ├── KanbanCard.tsx      # Sortable card with drag handle
│   ├── CardModal.tsx       # Edit dialog (status, priority, due date)
│   ├── TodoPanel.tsx       # Quick task checklist
│   ├── TodoItem.tsx        # Checkbox item with animations
│   └── NotesPanel.tsx      # Auto-saving scratchpad
└── lib/
    ├── types.ts            # TypeScript interfaces
    ├── storage.ts          # localStorage helpers
    └── hooks.ts            # useKanban, useTodos, useNotes
```

## License

MIT
