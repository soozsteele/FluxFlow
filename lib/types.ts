export type KanbanStatus = "todo" | "in-progress" | "complete";
export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: KanbanStatus;
  priority: Priority;
  dueDate?: number | null;
  order: number;
  createdAt: number;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}
