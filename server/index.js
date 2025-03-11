import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateAvatar } from './services/googleAI.js';

// Initialize environment variables
dotenv.config();

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (ext && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG files are allowed'));
    }
  }
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Avatar generation endpoint
app.post('/api/generate-avatar', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { style } = req.body;
    if (!style) {
      return res.status(400).json({ error: 'No avatar style specified' });
    }

    const imagePath = req.file.path;
    
    // Call Google AI service to generate avatar
    const result = await generateAvatar(imagePath, style);
    
    // In a real implementation, this would return the generated image
    // For now, we'll return a mock response
    res.status(200).json({
      success: true,
      message: 'Avatar generated successfully',
      avatarUrl: result.imageUrl || 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?q=80&w=300&auto=format&fit=crop',
      style
    });
    
  } catch (error) {
    console.error('Error generating avatar:', error);
    res.status(500).json({ 
      error: 'Failed to generate avatar', 
      message: error.message 
    });
  }
});

// Avatar customization endpoint
app.post('/api/customize-avatar', async (req, res) => {
  try {
    const { avatarUrl, style, instructions } = req.body;
    
    if (!avatarUrl || !style || !instructions) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        required: ['avatarUrl', 'style', 'instructions'] 
      });
    }
    
    // In a real implementation, this would call Google AI to modify the avatar
    // For now, we'll return a mock response
    res.status(200).json({
      success: true,
      message: 'Avatar customized successfully',
      avatarUrl: avatarUrl, // In a real implementation, this would be a new URL
      style,
      appliedInstructions: instructions
    });
    
  } catch (error) {
    console.error('Error customizing avatar:', error);
    res.status(500).json({ 
      error: 'Failed to customize avatar', 
      message: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});