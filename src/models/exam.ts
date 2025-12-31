import mongoose, { Schema, Document } from "mongoose";

export interface ExamDocument extends Document {
  name: string;
  amount: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const ExamSchema = new Schema<ExamDocument>({
  name: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Exam = mongoose.model("Exam", ExamSchema);

export { Exam };
