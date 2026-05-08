import { Storage, File } from "@google-cloud/storage";
import { Readable } from "stream";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function parseObjectPath(path: string): { bucketName: string; objectName: string } {
  const p = path.startsWith("/") ? path : `/${path}`;
  const parts = p.split("/");
  if (parts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

export class ObjectStorageService {
  getPublicObjectSearchPaths(): string[] {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p.length > 0),
      ),
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Provision object storage and set PUBLIC_OBJECT_SEARCH_PATHS env var.",
      );
    }
    return paths;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath.replace(/\/+$/, "")}/${filePath.replace(/^\/+/, "")}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const file = objectStorageClient.bucket(bucketName).file(objectName);
      const [exists] = await file.exists();
      if (exists) return file;
    }
    return null;
  }

  async downloadObject(file: File, cacheTtlSec = 3600): Promise<Response> {
    const [metadata] = await file.getMetadata();

    const nodeStream = file.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const headers: Record<string, string> = {
      "Content-Type": (metadata.contentType as string) || "application/octet-stream",
      "Cache-Control": `public, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) headers["Content-Length"] = String(metadata.size);

    return new Response(webStream, { headers });
  }

  /**
   * Upload a buffer into the first PUBLIC_OBJECT_SEARCH_PATHS root, under
   * `<prefix>/<uuid>.<ext>`. The returned `publicPath` is the path relative
   * to the public search root (suitable for GET /storage/public-objects/<publicPath>).
   */
  async uploadPublicBuffer({
    buffer,
    contentType,
    prefix,
    extension,
  }: {
    buffer: Buffer;
    contentType: string;
    prefix: string;
    extension: string;
  }): Promise<{ publicPath: string }> {
    const root = this.getPublicObjectSearchPaths()[0].replace(/\/+$/, "");
    const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "");
    const cleanExt = extension.replace(/^\.+/, "").toLowerCase();
    const objectId = randomUUID();
    const relPath = cleanExt
      ? `${cleanPrefix}/${objectId}.${cleanExt}`
      : `${cleanPrefix}/${objectId}`;
    const fullPath = `${root}/${relPath}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    const file = objectStorageClient.bucket(bucketName).file(objectName);
    await file.save(buffer, {
      contentType,
      resumable: false,
      metadata: { contentType },
    });
    return { publicPath: relPath };
  }
}
