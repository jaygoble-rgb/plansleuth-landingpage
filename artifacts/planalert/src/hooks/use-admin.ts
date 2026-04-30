import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { adminAuth, type AdminUser } from "@/lib/blog-api";

export function useAdminMe() {
  return useQuery<AdminUser | null>({
    queryKey: ["admin-me"],
    queryFn: async () => {
      try {
        return await adminAuth.me();
      } catch (e: unknown) {
        if (
          e !== null &&
          typeof e === "object" &&
          "status" in e &&
          (e as { status?: unknown }).status === 401
        ) {
          return null;
        }
        throw e;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => adminAuth.login(email, password),
    onSuccess: (user) => {
      qc.setQueryData(["admin-me"], user);
    },
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminAuth.logout(),
    onSuccess: () => {
      qc.setQueryData(["admin-me"], null);
      qc.invalidateQueries();
    },
  });
}
