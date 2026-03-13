"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { load, save } from "./storage";
import type { KanbanCard, KanbanStatus, Priority, TodoItem } from "./types";

// ── Generic localStorage hook ──────────────────────────────────

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setValue(load(key, fallback));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        save(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, set, loaded] as const;
}

// ── Kanban ──────────────────────────────────────────────────────

export function useKanban() {
  const [cards, setCards, loaded] = useLocalStorage<KanbanCard[]>("vm:kanban", []);

  const addCard = useCallback(
    (title: string, description: string, status: KanbanStatus, priority: Priority = "none") => {
      setCards((prev) => {
        const columCards = prev.filter((c) => c.status === status);
        const maxOrder = columCards.length > 0 ? Math.max(...columCards.map((c) => c.order)) : 0;
        const card: KanbanCard = {
          id: crypto.randomUUID(),
          title,
          description,
          status,
          priority,
          dueDate: null,
          order: maxOrder + 1,
          createdAt: Date.now(),
        };
        return [...prev, card];
      });
    },
    [setCards]
  );

  const updateCard = useCallback(
    (id: string, updates: Partial<Omit<KanbanCard, "id" | "createdAt">>) => {
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    },
    [setCards]
  );

  const deleteCard = useCallback(
    (id: string) => {
      setCards((prev) => prev.filter((c) => c.id !== id));
    },
    [setCards]
  );

  const moveCard = useCallback(
    (id: string, newStatus: KanbanStatus, newOrder: number) => {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus, order: newOrder } : c))
      );
    },
    [setCards]
  );

  const getColumnCards = useCallback(
    (status: KanbanStatus, sortByPriority: boolean = false) => {
      const filtered = cards.filter((c) => c.status === status);
      if (sortByPriority) {
        const rank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
        return filtered.sort((a, b) => {
          const pa = rank[a.priority || "none"] ?? 4;
          const pb = rank[b.priority || "none"] ?? 4;
          if (pa !== pb) return pa - pb;
          return a.order - b.order;
        });
      }
      return filtered.sort((a, b) => a.order - b.order);
    },
    [cards]
  );

  return { cards, addCard, updateCard, deleteCard, moveCard, getColumnCards, loaded };
}

// ── Todos ───────────────────────────────────────────────────────

export function useTodos() {
  const [todos, setTodos, loaded] = useLocalStorage<TodoItem[]>("vm:todos", []);

  const addTodo = useCallback(
    (text: string) => {
      setTodos((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() },
      ]);
    },
    [setTodos]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    },
    [setTodos]
  );

  const deleteTodo = useCallback(
    (id: string) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    },
    [setTodos]
  );

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.done));
  }, [setTodos]);

  return { todos, addTodo, toggleTodo, deleteTodo, clearCompleted, loaded };
}

// ── Notes ───────────────────────────────────────────────────────

export function useNotes() {
  const [notes, setNotes, loaded] = useLocalStorage<string>("vm:notes", "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setNotesDebounced = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setNotes(value);
      }, 500);
    },
    [setNotes]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { notes, setNotes, setNotesDebounced, loaded };
}
