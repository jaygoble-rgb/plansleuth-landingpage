import { User } from "lucide-react";

interface PostBylineProps {
  author?: string | null;
  credential?: string | null;
  className?: string;
}

/**
 * Byline shown under a blog post's title: author name plus an optional
 * short credential line (e.g. a role or expertise note).
 */
export function PostByline({ author, credential, className }: PostBylineProps) {
  if (!author) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <User className="w-4 h-4" />
      <span>
        <span className="font-medium text-primary">{author}</span>
        {credential ? (
          <span className="text-muted-foreground"> — {credential}</span>
        ) : null}
      </span>
    </span>
  );
}

export default PostByline;
