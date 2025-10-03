import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPdfFile extends Document {
  pdf_id: number;
  form_id: number;
  file_path: string;
  uploaded_at: Date;
}

const PdfFileSchema = new Schema<IPdfFile>({
  pdf_id: { type: Number, required: true },
  form_id: { type: Number, required: true },
  file_path: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
});

export const PdfFile: Model<IPdfFile> = mongoose.models.PdfFile || mongoose.model<IPdfFile>('PdfFile', PdfFileSchema);



