import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRoutes } from "./App";
import type { BlogPost, PostListResult } from "@/lib/blog-api";

export interface SsrData {
  post?: BlogPost;
  list?: PostListResult;
  categories?: string[];
}

export function render(path: string, data: SsrData = {}): string {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  if (data.post) {
    queryClient.setQueryData(["blog-post", data.post.slug], data.post);
  }
  if (data.list) {
    queryClient.setQueryData(
      ["blog-list", { page: 1, search: "", category: "" }],
      data.list,
    );
  }
  if (data.categories) {
    queryClient.setQueryData(["blog-cats"], { categories: data.categories });
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return renderToString(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={base} ssrPath={path}>
          <AppRoutes />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}
