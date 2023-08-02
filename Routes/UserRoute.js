import express from "express";
import { getUser } from "../Controllers/UserController.js";
import { updatUser } from "../Controllers/UserController.js";
import { deleteUser } from "../Controllers/UserController.js";
import { followUser } from "../Controllers/UserController.js";
import { unFollowUser } from "../Controllers/UserController.js";

const router = express.Router();

router.get("/:id", getUser);
router.put("/:id", updatUser);
router.delete("/:id", deleteUser);
router.put("/:id/follow", followUser);
router.put("/:id/unfollow", unFollowUser);

export default router;
