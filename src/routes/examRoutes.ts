import { Router } from "express";
import {
  createExam,
  getExams,
  updateExam,
  deleteExam,
  getExamById,
} from "../controllers/exam.Controller";

const router = Router();

router.post("/", createExam);
router.get("/", getExams);
router.get("/single", getExamById); // Use query param: /single?id=EXAM_ID
router.patch("/", updateExam);
router.delete("/", deleteExam);

export default router;
