"use client";

import { useState } from "react";
import { useTodos } from "@/lib/hooks";
import TodoItem from "./TodoItem";

export default function TodoPanel() {
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted, loaded } = useTodos();
  const [input, setInput] = useState("");

  const completedCount = todos.filter((t) => t.done).length;
  const activeCount = todos.length - completedCount;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    addTodo(text);
    setInput("");
  }

  if (!loaded) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12" style={{ borderBottom: "2px solid var(--color-border)" }}>
        <div className="flex items-center gap-3">
          <span className="panel-label">Quick Tasks</span>
          {todos.length > 0 && (
            <span
              className="text-[11px] font-medium tabular-nums"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-secondary)",
              }}
            >
              {activeCount}/{todos.length}
            </span>
          )}
        </div>
        {completedCount > 0 && (
          <button
            onClick={clearCompleted}
            className="text-[11px] font-medium transition-colors duration-100"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-tertiary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-tertiary)")}
          >
            Clear done
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {todos.length === 0 ? (
          <div className="empty-state h-full">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <rect x="4" y="4" width="24" height="24" rx="4" />
              <path d="M11 16l3 3 7-7" />
            </svg>
            <p>Add quick tasks to stay on track. They live here for fast access.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-px">
            {todos.map((todo, i) => (
              <div key={todo.id} className="animate-in" style={{ animationDelay: `${i * 20}ms` }}>
                <TodoItem item={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3" style={{ borderTop: "2px solid var(--color-border)" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task..."
          className="w-full bg-surface rounded px-3 py-2 text-text placeholder:text-text-tertiary outline-none focus-glow transition-all duration-150"
          style={{ fontSize: "12px", border: "2px solid var(--color-border)" }}
        />
      </form>
    </div>
  );
}
