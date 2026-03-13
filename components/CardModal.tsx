"use client";

import { useEffect, useRef, useState } from "react";
import type { KanbanCard, KanbanStatus, Priority } from "@/lib/types";

interface Props {
  card?: KanbanCard | null;
  defaultStatus?: KanbanStatus;
  onSave: (title: string, description: string, status: KanbanStatus, priority: Priority, dueDate: number | null) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const statuses: { value: KanbanStatus; label: string; color: string }[] = [
  { value: "todo", label: "Todo", color: "var(--color-status-todo)" },
  { value: "in-progress", label: "In Progress", color: "var(--color-status-progress)" },
  { value: "complete", label: "Done", color: "var(--color-status-complete)" },
];

const priorities: { value: Priority; label: string; color: string; bars: number }[] = [
  { value: "none", label: "None", color: "var(--color-text-tertiary)", bars: 0 },
  { value: "low", label: "Low", color: "var(--color-priority-low)", bars: 1 },
  { value: "medium", label: "Med", color: "var(--color-priority-medium)", bars: 2 },
  { value: "high", label: "High", color: "var(--color-priority-high)", bars: 3 },
  { value: "urgent", label: "Urgent", color: "var(--color-priority-urgent)", bars: 4 },
];

function toDateInputValue(ts: number | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toISOString().split("T")[0];
}

function fromDateInputValue(val: string): number | null {
  if (!val) return null;
  // Parse as local date (noon to avoid timezone issues)
  const [y, m, d] = val.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).getTime();
}

export default function CardModal({ card, defaultStatus = "todo", onSave, onDelete, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [status, setStatus] = useState<KanbanStatus>(card?.status ?? defaultStatus);
  const [priority, setPriority] = useState<Priority>(card?.priority ?? "none");
  const [dueDate, setDueDate] = useState<string>(toDateInputValue(card?.dueDate));

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), description.trim(), status, priority, fromDateInputValue(dueDate));
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="bg-surface rounded text-text p-0 w-full max-w-[440px] animate-pop"
      style={{
        border: "2px solid var(--color-border)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3
            className="text-[12px] font-semibold tracking-wide uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)",
            }}
          >
            {card ? "Edit Card" : "New Card"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-all duration-100"
            style={{ color: "var(--color-text-tertiary)", border: "2px solid var(--color-border)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text)";
              e.currentTarget.style.background = "var(--color-border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-tertiary)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Card title"
          autoFocus
          className="bg-bg rounded px-3 py-2.5 text-text placeholder:text-text-tertiary outline-none focus-glow transition-all duration-150"
          style={{ fontSize: "13px", fontFamily: "var(--font-mono)", fontWeight: 500, border: "2px solid var(--color-border)" }}
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="bg-bg rounded px-3 py-2.5 text-text placeholder:text-text-tertiary outline-none focus-glow transition-all duration-150 resize-none"
          style={{ fontSize: "12.5px", lineHeight: "1.6", border: "2px solid var(--color-border)" }}
        />

        {/* Status selector */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[10px] uppercase tracking-wider font-semibold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}
          >
            Status
          </span>
          <div className="flex gap-2">
            {statuses.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all duration-100"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: status === s.value ? "var(--color-surface-hover)" : "transparent",
                  border: status === s.value ? "2px solid var(--color-text-tertiary)" : "2px solid var(--color-border)",
                  color: status === s.value ? "var(--color-text)" : "var(--color-text-tertiary)",
                }}
              >
                <div
                  className="w-[6px] h-[6px] rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority selector */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[10px] uppercase tracking-wider font-semibold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}
          >
            Priority
          </span>
          <div className="flex gap-1.5">
            {priorities.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-medium transition-all duration-100"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: priority === p.value ? "var(--color-surface-hover)" : "transparent",
                  border: priority === p.value ? "2px solid var(--color-text-tertiary)" : "2px solid var(--color-border)",
                  color: priority === p.value ? "var(--color-text)" : "var(--color-text-tertiary)",
                }}
              >
                {p.bars > 0 && (
                  <div className="flex items-end gap-[2px]">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-[2px] rounded-sm"
                        style={{
                          height: `${3 + i * 1.5}px`,
                          background: i <= p.bars ? p.color : "var(--color-border)",
                        }}
                      />
                    ))}
                  </div>
                )}
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[10px] uppercase tracking-wider font-semibold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}
          >
            Due Date
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-bg rounded px-3 py-1.5 text-text outline-none focus-glow transition-all duration-150 date-input"
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                border: "2px solid var(--color-border)",
                colorScheme: "dark",
              }}
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate("")}
                className="text-[11px] font-medium transition-colors duration-100"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-tertiary)")}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Created date (edit only) */}
        {card && (
          <div
            className="text-[10px] font-medium"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}
          >
            Created {new Date(card.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "2px solid var(--color-border)" }}>
          <div>
            {card && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="text-[11px] font-medium transition-colors duration-100"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-tertiary)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-tertiary)")}
              >
                Delete card
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[11px] font-medium rounded transition-all duration-100"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)",
                border: "2px solid var(--color-border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-text-tertiary)";
                e.currentTarget.style.color = "var(--color-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-[11px] font-semibold rounded transition-all duration-100"
              style={{
                fontFamily: "var(--font-mono)",
                background: "var(--color-accent)",
                color: "var(--color-bg)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-accent-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-accent)")}
            >
              {card ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
