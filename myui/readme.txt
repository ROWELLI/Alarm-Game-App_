## Quick Start

### Backend:
```bash
cd backend
conda create -n vision python=3.10 -y
conda activate vision
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

### Frontend:
cd ..
npm install
npm run dev

### Open:
- Frontend: [http://localhost:3000](http://localhost:3000/)
- Backend docs: http://localhost:8000/docs