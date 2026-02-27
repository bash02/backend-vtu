import express from "express";
import { syncController, getUnsyncedController } from "../controllers/sync.Controller";

const router = express.Router();


// POST /api/sync
router.post("/", syncController);


// GET /api/sync/unsynced
router.get("/unsynced", getUnsyncedController);


export default router;
