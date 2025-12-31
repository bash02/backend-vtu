import type { Request, Response } from "express";
import { Exam } from "../models/exam";

// Create a new exam
export const createExam = async (req: Request, res: Response) => {
  try {
    const { name, amount } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount are required" });
    }
    const exam = await Exam.create({ name, amount });
    return res.json({ success: true, exam });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all exams
export const getExams = async (_req: Request, res: Response) => {
  try {
    const exams = await Exam.find();
    return res.json({ success: true, exams });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get a single exam by id
export const getExamById = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing id in query" });
    }
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }
    return res.json({ success: true, exam });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Update an exam
export const updateExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing id in query" });
    }
    const { name, amount, is_active } = req.body;
    const exam = await Exam.findByIdAndUpdate(
      id,
      { name, amount, is_active, updated_at: new Date() },
      { new: true }
    );
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    return res.json({ success: true, exam });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete an exam
export const deleteExam = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing id in query" });
    }
    const exam = await Exam.findByIdAndDelete(id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    return res.json({ success: true, message: "Exam deleted" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
