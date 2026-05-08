import { Router, type IRouter, type Response } from "express";
import multer from "multer";
import type { BlogImageUploadResponse } from "@workspace/api-zod";
import { requireAdmin, type AuthedRequest } from "../lib/auth";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("Unsupported file type. Use PNG, JPG, WebP, GIF, or SVG."));
      return;
    }
    cb(null, true);
  },
});

router.use("/admin/blog/uploads", requireAdmin);

router.post(
  "/admin/blog/uploads",
  (req: AuthedRequest, res: Response, next) => {
    upload.single("file")(req, res, (err: unknown) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(413).json({ error: "Image is too large. Max 5 MB." });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      const message = err instanceof Error ? err.message : "Upload failed";
      res.status(400).json({ error: message });
    });
  },
  async (req: AuthedRequest, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file provided. Field name must be 'file'." });
        return;
      }
      const ext = MIME_EXT[file.mimetype] ?? "bin";

      const { publicPath } = await objectStorage.uploadPublicBuffer({
        buffer: file.buffer,
        contentType: file.mimetype,
        prefix: "blog",
        extension: ext,
      });

      const payload: BlogImageUploadResponse = {
        url: `/api/storage/public-objects/${publicPath}`,
        contentType: file.mimetype,
        size: file.size,
      };
      res.status(201).json(payload);
    } catch (err) {
      req.log.error({ err }, "blog image upload failed");
      res.status(500).json({ error: "Failed to upload image" });
    }
  },
);

export default router;
