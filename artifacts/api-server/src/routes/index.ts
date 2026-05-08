import { Router, type IRouter } from "express";
import healthRouter from "./health";
import blogRouter from "./blog";
import seoRouter from "./seo";
import adminAuthRouter from "./admin-auth";
import waitlistRouter from "./waitlist";
import adminBlogRouter from "./admin-blog";
import adminUploadsRouter from "./admin-uploads";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(blogRouter);
router.use(seoRouter);
router.use(adminAuthRouter);
router.use(waitlistRouter);
router.use(adminBlogRouter);
router.use(adminUploadsRouter);
router.use(storageRouter);

export default router;
