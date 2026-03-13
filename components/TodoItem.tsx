"use client";

import { useState } from "react";
import type { TodoItem as TodoItemType } from "@/lib/types";

interface Props {
  item: TodoItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ item, onToggle, onDelete }: Props) {
  const [justChecked, setJustChecked] = useState(false);

  function handleToggle() {
    if (!item.done) setJustChecked(true);
    onToggle(item.id);
  }

  return (
    <div
      className="group flex items-center gap-2.5 px-2 py-1.5 rounded-sm transition-all duration-120"
      style={{ background: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`flex-none w-[15px] h-[15px] rounded-sm border flex items-center justify-center transition-all duration-120 ${justChecked ? "check-pop" : ""}`}
        onAnimationEnd={() => setJustChecked(false)}
        style={{
          borderColor: item.done ? "var(--color-status-complete)" : "var(--color-border)",
          background: item.done ? "var(--color-status-complete)" : "transparent",
          borderWidth: "2px",
        }}
      >
        {item.done && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="var(--color-bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        className="flex-1 min-w-0 truncate text-[12.5px] transition-all duration-150"
        style={{
          color: item.done ? "var(--color-text-tertiary)" : "var(--color-text)",
          textDecoration: item.done ? "line-through" : "none",
          textDecorationColor: "var(--color-text-tertiary)",
        }}
      >
        {item.text}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="flex-none opacity-0 group-hover:opacity-100 transition-opacity duration-100"
        style={{ color: "var(--color-text-tertiary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-tertiary)")}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 3l6 6M9 3l-6 6" />
        </svg>
      </button>
    </div>
  );
}
