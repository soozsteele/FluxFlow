"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useKanban } from "@/lib/hooks";
import type { KanbanCard as KanbanCardType, KanbanStatus, Priority } from "@/lib/types";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import CardModal from "./CardModal";

const COLUMNS: { status: KanbanStatus; title: string }[] = [
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "complete", title: "Complete" },
];

const FILTER_OPTIONS: { value: Priority | "all"; label: string; color?: string }[] = [
  { value: "all", label: "All" },
  { value: "urgent", label: "Urgent", color: "var(--color-priority-urgent)" },
  { value: "high", label: "High", color: "var(--color-priority-high)" },
  { value: "medium", label: "Medium", color: "var(--color-priority-medium)" },
  { value: "low", label: "Low", color: "var(--color-priority-low)" },
];

export default function KanbanBoard() {
  const { cards, addCard, updateCard, deleteCard, moveCard, getColumnCards, loaded } = useKanban();
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    card?: KanbanCardType;
    defaultStatus?: KanbanStatus;
  } | null>(null);
  const [sortByPriority, setSortByPriority] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filterRank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };

  const getFilteredColumnCards = useCallback(
    (status: KanbanStatus) => {
      const sorted = getColumnCards(status, sortByPriority);
      let filtered = sorted;

      // Priority filter: show cards at or above selected priority
      if (priorityFilter !== "all") {
        const threshold = filterRank[priorityFilter] ?? 999;
        filtered = filtered.filter((c) => {
          const rank = filterRank[c.priority || "none"] ?? 4;
          return rank <= threshold;
        });
      }

      // Search filter
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        );
      }

      return filtered;
    },
    [getColumnCards, sortByPriority, priorityFilter, search, filterRank]
  );

  const filteredCount = useMemo(() => {
    let count = 0;
    for (const col of COLUMNS) {
      count += getFilteredColumnCards(col.status).length;
    }
    return count;
  }, [getFilteredColumnCards]);

  const isFiltering = priorityFilter !== "all" || search.trim() !== "";

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const card = cards.find((c) => c.id === event.active.id);
      if (card) setActiveCard(card);
    },
    [cards]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const activeCardData = cards.find((c) => c.id === activeId);
      if (!activeCardData) return;

      let targetStatus: KanbanStatus;
      const overCard = cards.find((c) => c.id === overId);
      if (overCard) {
        targetStatus = overCard.status;
      } else if (["todo", "in-progress", "complete"].includes(overId)) {
        targetStatus = overId as KanbanStatus;
      } else {
        return;
      }

      if (activeCardData.status !== targetStatus) {
        moveCard(activeId, targetStatus, activeCardData.order);
      }
    },
    [cards, moveCard]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveCard(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const activeCardData = cards.find((c) => c.id === activeId);
      if (!activeCardData) return;

      let targetStatus: KanbanStatus = activeCardData.status;
      const overCard = cards.find((c) => c.id === overId);
      if (overCard) {
        targetStatus = overCard.status;
      } else if (["todo", "in-progress", "complete"].includes(overId)) {
        targetStatus = overId as KanbanStatus;
      }

      const columnCards = cards
        .filter((c) => c.status === targetStatus)
        .sort((a, b) => a.order - b.order);

      const oldIndex = columnCards.findIndex((c) => c.id === activeId);
      const newIndex = overCard
        ? columnCards.findIndex((c) => c.id === overId)
        : columnCards.length - 1;

      if (oldIndex === -1) {
        const targetOrder = overCard
          ? overCard.order
          : columnCards.length > 0
          ? columnCards[columnCards.length - 1].order + 1
          : 1;
        moveCard(activeId, targetStatus, targetOrder);
      } else if (oldIndex !== newIndex && newIndex !== -1) {
        const reordered = arrayMove(columnCards, oldIndex, newIndex);
        reordered.forEach((card, i) => {
          if (card.order !== i + 1) {
            moveCard(card.id, targetStatus, i + 1);
          }
        });
      }
    },
    [cards, moveCard]
  );

  // Quick-move card between columns (arrow buttons)
  const handleQuickMove = useCallback(
    (cardId: string, newStatus: KanbanStatus) => {
      const col = cards.filter((c) => c.status === newStatus);
      const maxOrder = col.length > 0 ? Math.max(...col.map((c) => c.order)) : 0;
      moveCard(cardId, newStatus, maxOrder + 1);
    },
    [cards, moveCard]
  );

  function handleCardClick(card: KanbanCardType) {
    setModal({ mode: "edit", card });
  }

  function handleModalSave(title: string, description: string, status: KanbanStatus, priority: Priority, dueDate: number | null) {
    if (modal?.mode === "edit" && modal.card) {
      updateCard(modal.card.id, { title, description, status, priority, dueDate });
    }
    setModal(null);
  }

  function handleModalDelete() {
    if (modal?.card) {
      deleteCard(modal.card.id);
    }
    setModal(null);
  }

  if (!loaded) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12" style={{ borderBottom: "2px solid var(--color-border)" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="panel-label">Board</span>
            <span
              className="text-[12px] font-medium"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)",
              }}
            >
              {isFiltering ? `${filteredCount} of ` : ""}{cards.length} {cards.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2"
              width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <circle cx="5" cy="5" r="3.5" />
              <path d="M7.5 7.5L10.5 10.5" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent rounded pl-7 pr-2 py-1 text-[11px] text-text placeholder:text-text-tertiary outline-none focus-glow transition-all duration-150"
              style={{
                fontFamily: "var(--font-mono)",
                border: "2px solid var(--color-border)",
                width: search ? "160px" : "100px",
              }}
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setPriorityFilter(priorityFilter === f.value ? "all" : f.value)}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-all duration-100"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: priorityFilter === f.value ? "var(--color-surface-hover)" : "transparent",
                  border: priorityFilter === f.value ? "2px solid var(--color-border)" : "2px solid transparent",
                  color: priorityFilter === f.value
                    ? "var(--color-text)"
                    : "var(--color-text-secondary)",
                }}
              >
                {f.color && (
                  <span
                    className="inline-block w-[7px] h-[7px] rounded-full"
                    style={{ background: f.color }}
                  />
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort toggle */}
        <button
          onClick={() => setSortByPriority((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-100"
          style={{
            fontFamily: "var(--font-mono)",
            background: sortByPriority ? "var(--color-accent-dim)" : "transparent",
            border: sortByPriority ? "2px solid var(--color-accent)" : "2px solid transparent",
            color: sortByPriority ? "var(--color-accent)" : "var(--color-text-secondary)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 3h10M1 6h7M1 9h4" />
          </svg>
          Priority sort
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden surface-grid">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-3 h-full">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                title={col.title}
                cards={getFilteredColumnCards(col.status)}
                onCardClick={handleCardClick}
                onMoveCard={handleQuickMove}
                onCreateCard={addCard}
                onAdd={() => {}}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? (
              <KanbanCard card={activeCard} onClick={() => {}} overlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {modal && (
        <CardModal
          card={modal.card}
          defaultStatus={modal.defaultStatus}
          onSave={handleModalSave}
          onDelete={modal.mode === "edit" ? handleModalDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
