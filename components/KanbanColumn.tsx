"use client";

import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { KanbanCard as KanbanCardType, KanbanStatus, Priority } from "@/lib/types";
import KanbanCard from "./KanbanCard";

interface Props {
  status: KanbanStatus;
  title: string;
  cards: KanbanCardType[];
  onCardClick: (card: KanbanCardType) => void;
  onMoveCard: (cardId: string, newStatus: KanbanStatus) => void;
  onCreateCard: (title: string, description: string, status: KanbanStatus, priority: Priority) => void;
  onAdd: () => void;
}

const emptyMessages: Record<KanbanStatus, string> = {
  "todo": "Nothing planned yet. Hit + to add your first task.",
  "in-progress": "No active work. Drag a task here or create one to get started.",
  "complete": "Nothing finished yet. Completed tasks will land here.",
};

export default function KanbanColumn({ status, title, cards, onCardClick, onMoveCard, onCreateCard }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: "column" } });
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const COLUMN_ORDER: KanbanStatus[] = ["todo", "in-progress", "complete"];
  const colIdx = COLUMN_ORDER.indexOf(status);

  useEffect(() => {
    if (isAdding && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (!isAdding) return;
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAdding]);

  function handleSubmit() {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      handleCancel();
      return;
    }
    onCreateCard(trimmed, newDesc.trim(), status, "none");
    setNewTitle("");
    setNewDesc("");
  }

  function handleCancel() {
    setIsAdding(false);
    setNewTitle("");
    setNewDesc("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  }

  return (
    <div className="flex flex-col h-full min-w-0 p-2">
      <div
        className="flex flex-col h-full rounded-lg transition-all duration-150"
        style={{
          border: isOver ? "2px solid var(--color-accent)" : "2px solid var(--color-border)",
          background: isOver ? "var(--color-accent-dim)" : "var(--color-surface)",
          boxShadow: isOver ? "0 0 20px var(--color-accent-dim)" : "none",
        }}
      >
        {/* Column header */}
        <div
          className="flex items-center justify-between px-3 py-3"
          style={{ borderBottom: "2px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <h3
              className="text-[14px] font-bold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {title}
            </h3>
            <span
              className="text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)",
                border: "2px solid var(--color-border)",
                background: "var(--color-bg)",
              }}
            >
              {cards.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-7 h-7 flex items-center justify-center rounded transition-all duration-100 cursor-pointer"
            style={{ color: "var(--color-text-secondary)", border: "2px solid var(--color-border)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text)";
              e.currentTarget.style.background = "var(--color-border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-secondary)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 3v8M3 7h8" />
            </svg>
          </button>
        </div>

        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto px-2 py-2 min-h-0"
        >
          {/* Drop indicator */}
          {isOver && cards.length === 0 && (
            <div
              className="rounded py-6 mb-2 flex items-center justify-center animate-drop-pulse"
              style={{
                border: "2px dashed var(--color-accent)",
                color: "var(--color-accent)",
              }}
            >
              <span className="text-[11px] font-medium" style={{ fontFamily: "var(--font-mono)" }}>
                Drop here
              </span>
            </div>
          )}

          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1.5">
              {cards.map((card, i) => (
                <div key={card.id} className="animate-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <KanbanCard
                    card={card}
                    onClick={() => onCardClick(card)}
                    onMoveLeft={colIdx > 0 ? () => onMoveCard(card.id, COLUMN_ORDER[colIdx - 1]) : undefined}
                    onMoveRight={colIdx < COLUMN_ORDER.length - 1 ? () => onMoveCard(card.id, COLUMN_ORDER[colIdx + 1]) : undefined}
                  />
                </div>
              ))}
            </div>
          </SortableContext>

          {/* Empty state */}
          {cards.length === 0 && !isOver && !isAdding && (
            <div className="empty-state">
              <p>{emptyMessages[status]}</p>
            </div>
          )}
        </div>

        {/* Inline add form OR "Add a task" button */}
        <div className="px-2 pb-2">
          {isAdding ? (
            <div
              ref={formRef}
              className="rounded p-3 flex flex-col gap-2 animate-pop"
              style={{
                border: "2px solid var(--color-accent)",
                background: "var(--color-bg)",
              }}
            >
              <input
                ref={titleRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Task title..."
                className="bg-transparent text-text placeholder:text-text-tertiary outline-none font-semibold"
                style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}
              />
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Description (optional)"
                rows={2}
                className="bg-transparent text-text-secondary placeholder:text-text-tertiary outline-none resize-none"
                style={{ fontSize: "12px", lineHeight: "1.5" }}
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
                  Enter to save · Esc to cancel
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-2.5 py-1 text-[11px] rounded font-medium transition-colors duration-100"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-text-secondary)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-2.5 py-1 text-[11px] rounded font-semibold transition-colors duration-100"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "var(--color-accent)",
                      color: "var(--color-bg)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-accent-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-accent)")}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 rounded flex items-center justify-center gap-2 transition-all duration-120 cursor-pointer"
              style={{
                border: "2px dashed var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-text-secondary)";
                e.currentTarget.style.color = "var(--color-text)";
                e.currentTarget.style.background = "var(--color-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-text-secondary)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 2v8M2 6h8" />
              </svg>
              <span className="text-[12px] font-medium" style={{ fontFamily: "var(--font-mono)" }}>
                Add a task
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
