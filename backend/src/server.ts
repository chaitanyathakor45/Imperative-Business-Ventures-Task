import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';

import { PdfFile } from './models/PdfFile';
import { PdfAnnotation } from './models/PdfAnnotation';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Directories
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// Static serving for frontend
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOAD_DIR));

// Multer storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  },
});
const upload = multer({ storage });

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Upload PDF -> returns pdf_id (process_id) + saved file record
app.post('/api/upload-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const processId = Number(req.body.process_id) || Math.floor(Math.random() * 100000);
    const formId = Number(req.body.form_id) || 0;

    const fileRelPath = path.join('uploads', path.basename(req.file.path)).replace(/\\/g, '/');

    const saved = await PdfFile.create({
      pdf_id: processId,
      form_id: formId,
      file_path: '/' + fileRelPath,
      uploaded_at: new Date(),
    });

    return res.json({
      ok: true,
      pdf_id: saved.pdf_id,
      form_id: saved.form_id,
      file_path: saved.file_path,
      file: saved,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// Bulk save annotations
app.post('/api/pdf-annotation-mappings/bulk/', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const items = Array.isArray(payload) ? payload : [payload];
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        return res.status(400).json({ error: 'Invalid payload item' });
      }
      const required = ['process', 'form_id', 'field_id', 'field_name', 'bbox', 'page', 'scale', 'field_type'];
      for (const k of required) {
        if (item[k] === undefined || item[k] === null) {
          return res.status(400).json({ error: `Missing field: ${k}` });
        }
      }
      if (!Array.isArray(item.bbox) || item.bbox.length !== 4) {
        return res.status(400).json({ error: 'bbox must be [x1,y1,x2,y2]' });
      }
    }

    const docs = items.map((i: any) => ({
      process: Number(i.process),
      form_id: Number(i.form_id),
      field_id: Number(i.field_id),
      field_name: String(i.field_name),
      field_header: i.field_header ? String(i.field_header) : '',
      bbox: i.bbox.map((n: any) => Number(n)),
      page: Number(i.page),
      scale: Number(i.scale),
      field_type: String(i.field_type),
      metadata: i.metadata || {},
      created_at: new Date(),
    }));

    const inserted = await PdfAnnotation.insertMany(docs);
    return res.json({ ok: true, inserted_count: inserted.length, annotations: inserted });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save annotations' });
  }
});

// Fetch annotations + metadata
app.post('/app_admin/api/fetch-create-table/', async (req: Request, res: Response) => {
  try {
    const { process_id, form_id } = req.body || {};
    if (process_id === undefined || form_id === undefined) {
      return res.status(400).json({ error: 'process_id and form_id required' });
    }

    const annotations = await PdfAnnotation.find({ process: Number(process_id), form_id: Number(form_id) }).lean();

    // Shape response roughly like the provided example
    const response = annotations.map((a: any) => ({
      id: a._id,
      annotation: {
        bbox: {
          x1: a.bbox[0],
          x2: a.bbox[2],
          y1: a.bbox[1],
          y2: a.bbox[3],
        },
        page: a.page,
        field_id: a.field_id,
        field_name: a.field_name,
        field_header: a.field_header,
        process: a.process,
        form_id: a.form_id,
      },
      table_name: `table_${a.process}_qc`,
      field_name: a.field_name,
      field_type: a.field_type,
      max_length: a?.metadata?.max_length || 0,
      relation_type: '',
      related_table_name: '',
      related_field: '',
      group: 1,
      field_header: a.field_header || '',
      placeholder: a.field_header || a.field_name,
      required: !!a?.metadata?.required,
      field_options: '[]',
      types: (a.field_type || '').toLowerCase().includes('date') ? 'date' : 'text',
      validation_code: null,
      required_if: null,
      regex_ptn: null,
      form_id: a.form_id,
      process_id: String(a.process),
    }));

    return res.json(response);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch annotations' });
  }
});

// Mongo connection and server start
const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/pdf_annotations_demo';

async function start() {
  await mongoose.connect(MONGO_URL);
  console.log('Mongo connected');
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});



