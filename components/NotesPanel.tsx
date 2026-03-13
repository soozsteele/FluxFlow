"use client";

import { useState, useEffect } from "react";
import { useNotes } from "@/lib/hooks";

export default function NotesPanel() {
  const { notes, setNotesDebounced, loaded } = useNotes();
  const [local, setLocal] = useState("");

  useEffect(() => {
    if (loaded) setLocal(notes);
  }, [loaded, notes]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setLocal(e.target.value);
    setNotesDebounced(e.target.value);
  }

  const charCount = local.length;

  if (!loaded) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12" style={{ borderBottom: "2px solid var(--color-border)" }}>
        <span className="panel-label">Notes</span>
        {charCount > 0 && (
          <span
            className="text-[11px] font-medium tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)",
            }}
          >
            {charCount.toLocaleString()}
          </span>
        )}
      </div>

      {/* Textarea */}
      <div className="flex-1 relative">
        {charCount === 0 && (
          <div className="absolute inset-0 flex items-start pointer-events-none">
            <div className="empty-state w-full pt-16">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <path d="M6 6h20v20H6z" />
                <path d="M10 12h12M10 16h8M10 20h10" />
              </svg>
              <p>Your scratchpad. Jot down ideas, links, or anything you need to remember.</p>
            </div>
          </div>
        )}
        <textarea
          value={local}
          onChange={handleChange}
          spellCheck={false}
          className="absolute inset-0 bg-transparent resize-none px-4 py-3 text-text outline-none surface-grid"
          style={{
            fontSize: "12.5px",
            lineHeight: "1.7",
            fontWeight: 300,
          }}
        />
      </div>
    </div>
  );
}
