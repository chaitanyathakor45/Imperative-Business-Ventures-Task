import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPdfAnnotation extends Document {
  process: number;
  form_id: number;
  field_id: number;
  field_name: string;
  field_header?: string;
  bbox: [number, number, number, number]; // [x1,y1,x2,y2]
  page: number;
  scale: number;
  field_type: string;
  metadata: Record<string, any>;
  created_at: Date;
}

const PdfAnnotationSchema = new Schema<IPdfAnnotation>({
  process: { type: Number, required: true },
  form_id: { type: Number, required: true },
  field_id: { type: Number, required: true },
  field_name: { type: String, required: true },
  field_header: { type: String },
  bbox: { type: [Number], required: true, validate: (v: number[]) => v.length === 4 },
  page: { type: Number, required: true },
  scale: { type: Number, required: true },
  field_type: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  created_at: { type: Date, default: Date.now },
});

export const PdfAnnotation: Model<IPdfAnnotation> = mongoose.models.PdfAnnotation || mongoose.model<IPdfAnnotation>('PdfAnnotation', PdfAnnotationSchema);



