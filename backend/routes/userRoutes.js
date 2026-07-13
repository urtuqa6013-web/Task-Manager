import express from "express";

import {
  getAllUsers,
  updateUserRoleController,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { deleteUserController } from "../controllers/userController.js";
import { updateUserController } from "../controllers/userController.js";
import { updateProfileController } from "../controllers/userController.js";

const router = express.Router();

// Admin + Manager can view users
router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getAllUsers
);

// Only Admin can change roles
router.put(
  "/:id/role",
  authMiddleware,
  authorizeRoles("admin"),
  updateUserRoleController
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteUserController
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  updateUserController
);


router.put(
  "/profile",
  authMiddleware,
  updateProfileController
);

export default router;