"use client";

import TodoPanel from "@/components/TodoPanel";
import KanbanBoard from "@/components/KanbanBoard";
import NotesPanel from "@/components/NotesPanel";

export default function Home() {
  return (
    <div className="h-screen grid grid-rows-[44px_1fr] grain-overlay">
      {/* Top bar */}
      <div
        className="flex items-center px-4"
        style={{ borderBottom: "2px solid var(--color-border)" }}
      >
        <span
          className="text-[15px] font-bold tracking-tight"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span style={{ color: "var(--color-text)" }}>Flux</span>
          <span style={{ color: "var(--color-accent)" }}>Flow</span>
        </span>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-[260px_1fr_280px] min-h-0">
        <aside
          className="overflow-hidden animate-fade"
          style={{ borderRight: "2px solid var(--color-border)" }}
        >
          <TodoPanel />
        </aside>
        <main className="overflow-hidden animate-fade" style={{ animationDelay: "50ms" }}>
          <KanbanBoard />
        </main>
        <aside
          className="overflow-hidden animate-fade"
          style={{ borderLeft: "2px solid var(--color-border)", animationDelay: "100ms" }}
        >
          <NotesPanel />
        </aside>
      </div>
    </div>
  );
}
