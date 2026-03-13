"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { KanbanCard as KanbanCardType, KanbanStatus, Priority } from "@/lib/types";

interface Props {
  card: KanbanCardType;
  onClick: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  overlay?: boolean;
}

const priorityDot: Record<Priority, string | null> = {
  none: null,
  low: "var(--color-priority-low)",
  medium: "var(--color-priority-medium)",
  high: "var(--color-priority-high)",
  urgent: "var(--color-priority-urgent)",
};

const COLUMN_ORDER: KanbanStatus[] = ["todo", "in-progress", "complete"];

function DragHandle() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor" className="flex-none">
      <circle cx="2" cy="2" r="1.2" />
      <circle cx="6" cy="2" r="1.2" />
      <circle cx="2" cy="7" r="1.2" />
      <circle cx="6" cy="7" r="1.2" />
      <circle cx="2" cy="12" r="1.2" />
      <circle cx="6" cy="12" r="1.2" />
    </svg>
  );
}

function getDueDateInfo(dueDate: number | null | undefined): { label: string; color: string; bg: string } | null {
  if (!dueDate) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: diffDays === -1 ? "Yesterday" : `${Math.abs(diffDays)}d overdue`,
      color: "var(--color-danger)",
      bg: "rgba(229, 72, 77, 0.12)",
    };
  }
  if (diffDays === 0) {
    return {
      label: "Today",
      color: "var(--color-priority-high)",
      bg: "rgba(247, 107, 21, 0.12)",
    };
  }
  if (diffDays === 1) {
    return {
      label: "Tomorrow",
      color: "var(--color-priority-medium)",
      bg: "rgba(229, 162, 0, 0.12)",
    };
  }
  if (diffDays <= 7) {
    return {
      label: `${diffDays}d`,
      color: "var(--color-text-secondary)",
      bg: "transparent",
    };
  }

  const formatted = dueDay.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return {
    label: formatted,
    color: "var(--color-text-tertiary)",
    bg: "transparent",
  };
}

export default function KanbanCard({ card, onClick, onMoveLeft, onMoveRight, overlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 120ms ease, opacity 120ms ease",
    opacity: isDragging ? 0.25 : 1,
  };

  const priority = card.priority || "none";
  const dotColor = priorityDot[priority];
  const colIdx = COLUMN_ORDER.indexOf(card.status);
  const canMoveLeft = colIdx > 0;
  const canMoveRight = colIdx < COLUMN_ORDER.length - 1;
  const dueDateInfo = getDueDateInfo(card.dueDate);

  if (overlay) {
    return (
      <div
        className="bg-surface rounded p-3 flex items-start gap-2.5 drag-overlay"
      >
        <div style={{ color: "var(--color-accent)" }}><DragHandle /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            {dotColor && (
              <div className="flex-none w-[8px] h-[8px] rounded-full" style={{ background: dotColor }} />
            )}
            <p className="font-semibold truncate" style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}>
              {card.title}
            </p>
          </div>
          {card.description && (
            <p className="text-text-secondary mt-1 line-clamp-2" style={{ fontSize: "12px", lineHeight: "1.5" }}>
              {card.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, border: "2px solid var(--color-border)" }}
      className="group/card relative bg-surface-hover rounded p-3 card-hover"
    >
      <div className="flex items-start gap-2.5">
        {/* Drag handle */}
        <div
          className="flex-none pt-0.5 cursor-grab active:cursor-grabbing transition-opacity duration-100 opacity-30 group-hover/card:opacity-70"
          style={{ color: "var(--color-text-secondary)" }}
          {...attributes}
          {...listeners}
        >
          <DragHandle />
        </div>

        {/* Card content — click to edit */}
        <div className="min-w-0 flex-1 cursor-pointer" onClick={onClick}>
          <div className="flex items-center gap-2 min-w-0">
            {dotColor && (
              <div className="flex-none w-[8px] h-[8px] rounded-full" style={{ background: dotColor }} />
            )}
            <p className="font-semibold truncate" style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}>
              {card.title}
            </p>
          </div>
          {card.description && (
            <p className="text-text-secondary mt-1 line-clamp-2" style={{ fontSize: "12px", lineHeight: "1.5" }}>
              {card.description}
            </p>
          )}
          {/* Due date badge */}
          {dueDateInfo && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                style={{
                  background: dueDateInfo.bg,
                  border: dueDateInfo.bg !== "transparent" ? "none" : undefined,
                }}
              >
                <svg
                  width="10" height="10" viewBox="0 0 12 12" fill="none"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
                  style={{ color: dueDateInfo.color }}
                >
                  <circle cx="6" cy="6" r="4.5" />
                  <path d="M6 3.5V6l2 1.5" />
                </svg>
                <span
                  className="text-[10px] font-medium"
                  style={{ fontFamily: "var(--font-mono)", color: dueDateInfo.color }}
                >
                  {dueDateInfo.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick-move arrows */}
        <div className="flex-none flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-100">
          {canMoveLeft && onMoveLeft && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}
              className="w-6 h-6 flex items-center justify-center rounded transition-all duration-100"
              style={{ color: "var(--color-text-secondary)", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-text)";
                e.currentTarget.style.background = "var(--color-border)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.background = "var(--color-surface)";
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 5l3 3" />
              </svg>
            </button>
          )}
          {canMoveRight && onMoveRight && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveRight(); }}
              className="w-6 h-6 flex items-center justify-center rounded transition-all duration-100"
              style={{ color: "var(--color-text-secondary)", background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-text)";
                e.currentTarget.style.background = "var(--color-border)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.background = "var(--color-surface)";
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 2l3 3-3 3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
