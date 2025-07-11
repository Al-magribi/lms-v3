import { Router } from "express";
import { pool } from "../../config/config.js";
import { authorize } from "../../middleware/auth.js";

const router = Router();

export default router;
