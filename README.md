# FaceSwapAI

## Technical Knowledge Transfer (KT)

FaceSwapAI is a web application that allows users to perform face swaps using a React frontend and a Flask backend. The backend handles image processing and face swapping, while the frontend provides a user-friendly interface.

### Project Structure
- `app/` - Flask backend code
- `static/react/` - React frontend source code
- `static/dist/` - Compiled frontend assets (e.g., `bundle.js`)
- `models/` - Model files (not included in the repo; see below)

## How to Run

### 1. Backend (Flask)
1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Run the Flask app:**
   ```bash
   python app.py
   ```
   The backend will start on `http://localhost:5000` by default.

### 2. Frontend (React)
1. **Install Node.js dependencies:**
   ```bash
   cd static/react
   npm install
   ```
2. **Build the frontend:**
   ```bash
   npm run build
   ```
   This will generate `bundle.js` in `static/dist/`.

### 3. Model Files
- **Model files are NOT included in the repository.**
- Download the required `.onnx` models and place them in the `models/` directory as specified in the backend code.
- Example model structure:
  - `models/buffalo_l/2d106det.onnx`
  - `models/buffalo_l/det_10g.onnx`
  - `models/buffalo_l/genderage.onnx`

## Notes
- Do NOT commit `node_modules/` or large model files to the repository.
- Use `.gitignore` to exclude these directories/files.
- For any issues, check the backend logs or browser console for errors.

---

For further development or deployment, refer to the comments in the codebase or contact the maintainers. 