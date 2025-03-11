# AI Avatar Generator

A web application that allows users to upload photos and transform them into stylized avatars using Google's AI services.

## Features

- Upload photos of people
- Generate avatars in various styles (Pixar/Disney, Anime, Simpsons, etc.)
- Chat with AI to customize avatars
- Download generated avatars
- Adjust avatar settings (brightness, contrast, etc.)

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- AI Integration: Google Vertex AI (Gemini Pro Vision)

## Getting Started

### Prerequisites

- Node.js (v16+)
- Google Cloud account with Vertex AI API enabled
- Google Cloud service account credentials

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   GOOGLE_APPLICATION_CREDENTIALS="./google-credentials.json"
   GOOGLE_CLOUD_PROJECT_ID="your-project-id"
   GOOGLE_CLOUD_LOCATION="us-central1"
   PORT=3001
   CLIENT_URL="http://localhost:5173"
   ```
4. Place your Google Cloud service account credentials in `google-credentials.json` (see `google-credentials-example.json` for format)

### Running the Application

1. Start the backend server:
   ```
   npm run server
   ```
2. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`

## Production Deployment

For production deployment:

1. Build the frontend:
   ```
   npm run build
   ```
2. Serve the static files from the `dist` directory
3. Ensure the backend server is running with proper environment variables

## Notes

- In the current implementation, the backend uses mock data instead of actual Google AI API calls
- To connect to Google's AI services in production, uncomment the relevant code in `server/services/googleAI.js`
- Make sure to properly secure your API keys and credentials in a production environment