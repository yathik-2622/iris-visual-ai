# 🌸 Iris Visual AI

> Real-time Iris flower species classifier with interactive 3D visualization  
> Built by **Yathik** · **RyStudios**

![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi)

![Plotly](https://img.shields.io/badge/Plotly-3D%20Charts-3D4DB7?style=flat-square)

![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)

![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square)

---

## 🚀 Live Demo
| Layer | URL |
|-------|-----|
| 🌐 Frontend | https://iris-visual-ai-frontend.vercel.app |
| ⚙️ Backend API | https://iris-visual-ai-api.onrender.com |

---

## ✨ Features
- 🤖 ML model trained on the classic Iris dataset
- 📊 Interactive 3D Plotly scatter plots
- ⚡ Real-time species prediction with probability scores
- 🎯 Highlights your input point live in the 3D chart
- 🌙 Sleek dark UI with smooth animations

---

## 🛠️ Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | HTML, CSS, Vanilla JS, Plotly.js |
| Backend | Python, FastAPI, Uvicorn |
| ML Model | Scikit-learn, Joblib |
| Deploy Frontend | Vercel (Free) |
| Deploy Backend | Render (Free) |

---

## 📁 Project Structure
```
IRIS_JS_APP_FAST_API/
├── backend/
│   ├── api.py
│   ├── iris_model.joblib
│   ├── iris_scaler.joblib
│   ├── iris_label_encoder.joblib
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── main.js
│   └── style.css
├── render.yaml
├── vercel.json
└── README.md
```

---

## ⚙️ Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn api:app --reload --port 8001
```

### Frontend
```bash
# Just open frontend/index.html in browser
# Or use Live Server in VS Code
```

---

## 🎬 Part of RyStudios App Suite
> This is App #1 of many ML projects under the RyStudios portfolio.

---

© 2025 Yathik · RyStudios. All rights reserved.