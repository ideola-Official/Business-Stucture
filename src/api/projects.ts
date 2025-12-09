import { Connection, Node } from "../types";

export interface SaveProjectPayload {
  title: string;
  userId: string;
  blocks: Node[];
  connections: Connection[];
}

export async function saveProject(payload: SaveProjectPayload) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to save project");
  }

  return res.json();
}

export async function loadProject(id: string) {
  const res = await fetch(`/api/projects/${id}`);

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to load project");
  }

  return res.json();
}

