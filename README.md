# FaceSwapAI - Full Stack Application

This is a full-stack application with a React frontend and Flask backend.

## Project Structure
```
faceswapai/
├── backend/           # Flask backend
│   ├── app.py
│   ├── requirements.txt
│   ├── wsgi.py
│   └── ...
├── frontend/          # React frontend
│   ├── package.json
│   ├── src/
│   └── ...
└── README.md
```

## Backend Setup (Flask)

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
export SESSION_SECRET=your_secret_key
export HUGGINGFACE_TOKEN=your_token_if_needed
```

4. Run the development server:
```bash
python wsgi.py
```

## Frontend Setup (React)

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm start
```

## Deployment

### Backend Deployment (PythonAnywhere)

1. Sign up for PythonAnywhere
2. Upload backend code to PythonAnywhere
3. Set up virtual environment and install requirements
4. Configure WSGI file
5. Set up environment variables
6. Configure static files

### Frontend Deployment (Vercel/Netlify)

1. Build the React app:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel or Netlify:
- Connect your GitHub repository
- Set build command: `npm run build`
- Set output directory: `build`

## Environment Variables

### Backend (.env)
```
SESSION_SECRET=your_secret_key
HUGGINGFACE_TOKEN=your_token_if_needed
```

### Frontend (.env)
```
REACT_APP_API_URL=your_backend_url
```

## Production Considerations

1. Enable CORS on backend
2. Set up proper error handling
3. Configure proper security headers
4. Set up proper logging
5. Configure proper file upload limits

---

For further development or deployment, refer to the comments in the codebase or contact the maintainers. 