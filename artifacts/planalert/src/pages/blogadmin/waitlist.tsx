import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, Mail } from "lucide-react";
import { AdminShell, AdminGuard } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
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
import { adminWaitlist, type WaitlistSignup } from "@/lib/blog-api";

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function WaitlistInner() {
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<WaitlistSignup | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: () => adminWaitlist.list(),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => adminWaitlist.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-waitlist"] }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <AdminShell
      title="Waitlist"
      actions={
        <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-white" data-testid="button-export-csv">
          <a href={adminWaitlist.csvUrl()}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </a>
        </Button>
      }
    >
      <div className="bg-white border border-primary/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-primary/10 flex items-center gap-3 text-sm text-muted-foreground">
          <Mail className="w-4 h-4 text-secondary" />
          <span>
            <strong className="text-primary">{total}</strong> total signup{total === 1 ? "" : "s"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  No signups yet. Once people join, they'll appear here.
                </td></tr>
              )}
              {items.map((s) => (
                <tr key={s.id} className="border-t border-primary/5 hover:bg-muted/20" data-testid={`row-signup-${s.email}`}>
                  <td className="px-4 py-3 font-medium text-primary">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete"
                        onClick={() => setConfirmDelete(s)}
                        data-testid={`button-delete-signup-${s.email}`}
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
            <AlertDialogTitle>Remove this signup?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.email} will be removed from the waitlist. This cannot be undone.
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
              data-testid="button-confirm-delete-signup"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

export default function BlogAdminWaitlist() {
  return (
    <AdminGuard>
      <WaitlistInner />
    </AdminGuard>
  );
}
