import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Edit, Trash2, ExternalLink, Filter } from "lucide-react";
import { AdminShell, AdminGuard, NewPostButton } from "@/components/admin-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminBlog, type BlogPost } from "@/lib/blog-api";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-foreground",
  published: "bg-secondary/20 text-secondary-foreground",
  scheduled: "bg-primary/10 text-primary",
  archived: "bg-destructive/10 text-destructive",
};

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function DashboardInner() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-blog-list", { search, status }],
    queryFn: () => adminBlog.list({ search, status, pageSize: 50 }),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => adminBlog.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog-list"] }),
  });

  const items = data?.items ?? [];

  return (
    <AdminShell title="Posts" actions={<NewPostButton />}>
      <div className="bg-white border border-primary/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-primary/10 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="pl-9 h-10"
              data-testid="input-admin-search"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
              <SelectTrigger className="w-44" data-testid="select-admin-status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No posts yet. <Link href="/blogadmin/new" className="text-secondary hover:underline">Create the first one</Link>.
                </td></tr>
              )}
              {items.map((p) => (
                <tr key={p.id} className="border-t border-primary/5 hover:bg-muted/20" data-testid={`row-post-${p.slug}`}>
                  <td className="px-4 py-3">
                    <Link href={`/blogadmin/edit/${p.id}`} className="font-medium text-primary hover:text-secondary">
                      {p.title || <em className="text-muted-foreground">(untitled)</em>}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">/blog/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLORS[p.status] || ""}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.author || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {p.status === "published" && (
                        <Button asChild variant="ghost" size="sm" title="View live">
                          <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" data-testid={`button-view-${p.slug}`}>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm" title="Edit">
                        <Link href={`/blogadmin/edit/${p.id}`} data-testid={`button-edit-${p.slug}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        onClick={() => setConfirmDelete(p)}
                        data-testid={`button-delete-${p.slug}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.title}" will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (confirmDelete) await removeMut.mutateAsync(confirmDelete.id);
                setConfirmDelete(null);
              }}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

export default function BlogAdminDashboard() {
  return (
    <AdminGuard>
      <DashboardInner />
    </AdminGuard>
  );
}
