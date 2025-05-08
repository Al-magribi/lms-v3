import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { pool } from "../../config/config.js";

const router = Router();

router.get("/", authorize("cms"), async (req, res) => {
  const { page, limit, search } = req.query;
});

export default router;
