// Thin fetch wrapper for the blog API. Uses same-origin /api routes which
// are proxied by the workspace router to the api-server artifact.

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  author: string;
  authorCredential: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "scheduled" | "archived";
  publishDate: string | null;
  scheduledPublishAt?: string | null;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  openGraphImageUrl: string;
  commentsEnabled: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostListResult {
  items: BlogPost[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!res.ok) {
    const errField =
      data && typeof data === "object" && "error" in data
        ? (data as { error?: unknown }).error
        : undefined;
    const message = typeof errField === "string" && errField ? errField : res.statusText;
    const err = new Error(message) as Error & { status?: number; data?: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

// ---- Public ----
export const publicBlog = {
  list: (params: { page?: number; pageSize?: number; search?: string; category?: string; tag?: string } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) qs.set(k, String(v));
    });
    return http<PostListResult>(`/blog/posts?${qs.toString()}`);
  },
  get: (slug: string) => http<BlogPost>(`/blog/posts/${encodeURIComponent(slug)}`),
  categories: () => http<{ categories: string[] }>(`/blog/categories`),
};

// ---- Admin ----
export const adminAuth = {
  me: () => http<AdminUser>("/admin/auth/me"),
  login: (email: string, password: string) =>
    http<AdminUser>("/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => http<{ ok: true }>("/admin/auth/logout", { method: "POST" }),
};

export interface WaitlistSignup {
  id: string;
  email: string;
  source: string;
  referrer: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
}

export const waitlist = {
  signup: (email: string, source = "home") =>
    http<{ ok: true }>("/waitlist", { method: "POST", body: JSON.stringify({ email, source }) }),
};

export const adminWaitlist = {
  list: () => http<{ items: WaitlistSignup[]; total: number }>("/admin/waitlist"),
  remove: (id: string) =>
    http<{ ok: true }>(`/admin/waitlist/${id}`, { method: "DELETE" }),
  csvUrl: () => `${API_BASE}/admin/waitlist.csv`,
};

export const adminBlog = {
  list: (params: { page?: number; pageSize?: number; status?: string; search?: string; author?: string; category?: string } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) qs.set(k, String(v));
    });
    return http<PostListResult>(`/admin/blog/posts?${qs.toString()}`);
  },
  get: (id: string) => http<BlogPost>(`/admin/blog/posts/${id}`),
  create: (data: Partial<BlogPost>) =>
    http<BlogPost>("/admin/blog/posts", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<BlogPost>) =>
    http<BlogPost>(`/admin/blog/posts/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) =>
    http<{ ok: true }>(`/admin/blog/posts/${id}`, { method: "DELETE" }),
  slugCheck: (slug: string, excludeId?: string) => {
    const qs = new URLSearchParams({ slug });
    if (excludeId) qs.set("excludeId", excludeId);
    return http<{ available: boolean; slug: string }>(`/admin/blog/slug-check?${qs.toString()}`);
  },
};
