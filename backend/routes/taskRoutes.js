import express from "express";

import {
  createTaskController,
  getTasksController,
  updateTaskController,
  deleteTaskController,
  dashboardStatsController,
} from "../controllers/taskController.js";

import upload from "../middleware/upload.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeRoles("admin", "manager", "user"),
  upload.single("attachment"),
  createTaskController
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "user"),
  getTasksController
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "user"),
  updateTaskController
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "user", ),
  deleteTaskController
);

router.get(
  "/stats",
  authMiddleware,
  authorizeRoles("admin", "manager", "user"),
  dashboardStatsController
);

export default router;