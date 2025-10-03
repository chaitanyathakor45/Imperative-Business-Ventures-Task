# PDF Field Mapping & Annotation Management System

A modern, interactive web application for mapping fields on PDF documents, generating bounding box coordinates, and managing annotations with a beautiful AngularJS frontend and Node.js backend.

## 🚀 Features

- **PDF Upload & Preview**: Upload PDF files and view them in an interactive preview
- **Interactive Annotation**: Draw bounding boxes directly on PDF pages with mouse drag
- **Field Mapping**: Map drawn regions to form fields with metadata (name, type, validation rules)
- **Real-time Management**: Toggle drawing mode, clear selections, delete individual annotations
- **Data Persistence**: Save annotations to MongoDB with full metadata support
- **Visual Feedback**: Modern UI with animations, loading states, and status messages
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **AngularJS 1.8.3** - Frontend framework
- **Vanilla JavaScript** - Core functionality
- **CSS3** - Modern styling with animations
- **HTML5** - Semantic markup

### Development Tools
- **Nodemon** - Development server with auto-restart
- **ts-node** - TypeScript execution for Node.js
- **TypeScript Compiler** - Type checking and compilation

## 📋 Prerequisites


## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd r3/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```bash
# If installed as a service
net start MongoDB

# Or run manually
mongod
```


```bash
#  run manually
mongod
```

### 4. Start the Development Server
```bash
npm run dev
```

### 5. Open the Application
Navigate to `http://localhost:4000` in your web browser.

## 📁 Project Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── PdfFile.ts          # PDF file metadata model
│   │   └── PdfAnnotation.ts    # Annotation data model
│   ├── public/
│   │   ├── index.html          # Main frontend application
│   │   └── styles.css          # Application styling
│   └── server.ts               # Express server configuration
├── uploads/                    # PDF file storage (created at runtime)
├── dist/                       # Compiled JavaScript (created after build)
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm install` | Install all dependencies |

## 🌐 API Endpoints

### Upload PDF
```http
POST /api/upload-pdf
Content-Type: multipart/form-data

Parameters:
- file: PDF file
- process_id: Process identifier (number)
- form_id: Form identifier (number)

Response:
{
  "ok": true,
  "pdf_id": 49,
  "form_id": 20,
  "file_path": "/uploads/filename.pdf"
}
```

### Save Annotations
```http
POST /api/pdf-annotation-mappings/bulk/
Content-Type: application/json

Body:
[
  {
    "process": 49,
    "form_id": 20,
    "field_id": 125,
    "field_name": "Bar_Code",
    "field_header": "Enter barcode",
    "bbox": [100, 250, 300, 300],
    "page": 1,
    "scale": 1.5,
    "field_type": "CharField",
    "metadata": {
      "required": true,
      "max_length": 50
    }
  }
]
```

### Fetch Annotations
```http
POST /app_admin/api/fetch-create-table/
Content-Type: application/json

Body:
{
  "process_id": 49,
  "form_id": 20
}

Response:
[
  {
    "id": "annotation_id",
    "annotation": {
      "bbox": { "x1": 0.1757, "x2": 0.2654, "y1": 0.0139, "y2": 0.0159 },
      "page": 1,
      "field_id": 124,
      "field_name": "Application_Date",
      "field_header": "Account Details",
      "process": 49,
      "form_id": 20
    },
    "field_type": "DateField",
    "required": false,
    "max_length": 0
  }
]
```

## 🗄️ Database Schema

### PDF Files Collection
```javascript
{
  "_id": ObjectId,
  "pdf_id": Number,        // Process identifier
  "form_id": Number,       // Form identifier
  "file_path": String,     // Relative file path
  "uploaded_at": Date      // Upload timestamp
}
```

### PDF Annotations Collection
```javascript
{
  "_id": ObjectId,
  "process": Number,       // Process identifier
  "form_id": Number,       // Form identifier
  "field_id": Number,      // Field identifier
  "field_name": String,    // Field name
  "field_header": String,  // Display label
  "bbox": [Number],        // [x1, y1, x2, y2] coordinates
  "page": Number,          // PDF page number
  "scale": Number,         // Scale factor
  "field_type": String,    // Field type (CharField, DateField, etc.)
  "metadata": Object,      // Additional field properties
  "created_at": Date       // Creation timestamp
}
```

## 🎯 Usage Guide

### 1. Upload a PDF
1. Select a PDF file using the "Choose File" button
2. Enter Process ID and Form ID
3. Click "Upload PDF"
4. Wait for the success message and PDF preview to appear

### 2. Draw Annotations
1. Ensure "Drawing: ON" is active (blue button)
2. Click and drag on the PDF preview to draw bounding boxes
3. Each drawn box appears in the "Current Selections" list
4. Use "Clear Boxes" to remove all current selections

### 3. Configure Field Properties
1. Fill in the "New Annotation" form:
   - **Field ID**: Unique identifier
   - **Field Name**: Internal field name
   - **Field Header**: Display label
   - **Field Type**: Choose from dropdown (CharField, DateField, IntegerField)
   - **Required**: Check if field is mandatory
   - **Max Length**: Maximum character limit

### 4. Save Annotations
1. Click "Save Selected Boxes" to persist all current selections
2. Wait for the success confirmation
3. All drawn boxes will be cleared after successful save

### 5. Fetch and Highlight
1. Click "Fetch Saved Annotations" to retrieve previously saved data
2. Click any item in the "Saved Annotations" list to highlight its bounding box on the PDF

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```bash
# MongoDB connection string
MONGO_URL=mongodb://127.0.0.1:27017/pdf_annotations_demo

# Server port
PORT=4000

# Upload directory
UPLOAD_DIR=uploads
```

### MongoDB Configuration
The application connects to MongoDB using the default connection string:
```
mongodb://127.0.0.1:27017/pdf_annotations_demo
```

To use a different database or connection string, set the `MONGO_URL` environment variable.

## 🚀 Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Environment Setup
- Ensure MongoDB is running and accessible
- Set appropriate environment variables
- Set up SSL certificates for HTTPS

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running
- Check if the port 27017 is accessible
- Verify the connection string in environment variables

**PDF Upload Fails:**
- Check file size limits
- Ensure the file is a valid PDF
- Verify uploads directory permissions

**TypeScript Compilation Errors:**
- Run `npm run build` to see detailed error messages
- Ensure all dependencies are installed
- Check TypeScript configuration


## 🎨 Screenshots

<img width="1290" height="905" alt="image" src="https://github.com/user-attachments/assets/e5a141f4-7689-42df-81fc-f5c8920ea4bd" />

<img width="1268" height="879" alt="image" src="https://github.com/user-attachments/assets/9830bd80-5b24-4462-91b5-0477c39d6084" />

<img width="1235" height="864" alt="image" src="https://github.com/user-attachments/assets/b25fc16a-df4b-4d7b-86a5-3e64e9b5bb14" />

<img width="1183" height="833" alt="image" src="https://github.com/user-attachments/assets/8001aa40-fddc-4ab3-b3e3-24aeea3f5f11" />





