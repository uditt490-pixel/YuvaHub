import { Project } from "../models/projectSchema";

const API_BASE_URL = "/api/v1";

export interface ProjectFilterParams {
  q?: string;
  tech?: string;
  category?: string;
  difficulty?: string;
  status?: string;
  isOpenSource?: boolean;
  isBeginnerFriendly?: boolean;
  isRemoteCollaboration?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface ProjectVaultResponse {
  results: Project[];
  items: Project[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  meta: {
    query?: string;
    total_found: number;
    page: number;
    limit: number;
    totalPages: number;
    sortBy?: string;
  };
}

export async function fetchProjects(params: ProjectFilterParams = {}): Promise<ProjectVaultResponse> {
  const query = new URLSearchParams();
  if (params.q) query.append("q", params.q);
  if (params.tech && params.tech !== "all") query.append("tech", params.tech);
  if (params.category && params.category !== "all") query.append("category", params.category);
  if (params.difficulty && params.difficulty !== "all") query.append("difficulty", params.difficulty);
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.isOpenSource !== undefined) query.append("isOpenSource", String(params.isOpenSource));
  if (params.isBeginnerFriendly !== undefined) query.append("isBeginnerFriendly", String(params.isBeginnerFriendly));
  if (params.isRemoteCollaboration !== undefined) query.append("isRemoteCollaboration", String(params.isRemoteCollaboration));
  if (params.isFeatured !== undefined) query.append("isFeatured", String(params.isFeatured));
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));

  const res = await fetch(`${API_BASE_URL}/projects?${query.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch projects from Project Vault");
  }
  const data = await res.json();
  return data.data || data;
}

export async function fetchProjectById(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`);
  if (!res.ok) throw new Error("Failed to fetch project details");
  const data = await res.json();
  return data.data?.project || data.project;
}

export async function submitProjectToVault(payload: any): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to submit project");
  }
  const data = await res.json();
  return data.data?.project || data.project;
}

export async function toggleProjectUpvoteApi(id: string): Promise<{ upvotes: number; stars: number; upvoted: boolean }> {
  const res = await fetch(`${API_BASE_URL}/projects/${id}/upvote`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to upvote project");
  const data = await res.json();
  return data.data || data;
}

export async function updateProjectApi(id: string, payload: Partial<Omit<Project, '_id' | 'id' | 'createdAt' | 'views' | 'upvotes' | 'stars'>>): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error((errData as any).error || "Failed to update project");
  }
  const data = await res.json();
  return data.data?.project || data.project;
}
