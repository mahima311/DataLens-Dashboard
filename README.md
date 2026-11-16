# 📊 DataLens – Interactive Data Analytics Dashboard

**DataLens** is an interactive data analytics platform that helps users upload datasets, analyze data, explore key statistics, and understand their data through meaningful insights and visualizations.

## 🚀 Features

- **Dataset Upload:** Upload CSV, Excel (.xlsx), and Excel (.xls) files.
- **Automated Data Analysis:** Analyze datasets and view important statistics.
- **Key Performance Indicators:** View total rows, columns, missing values, and duplicate records.
- **Data Visualization:** Explore data through interactive charts and visual representations.
- **Data Insights:** Get meaningful information from uploaded datasets.
- **Dataset History:** Access previously saved analysis records.
- **Dashboard:** View an overview of your data analysis activity.
- **Reset Option:** Clear saved dataset analysis data when needed.
- **User Interface:** Clean and responsive interface with login and signup pages.

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- Vite
- CSS
- React Router
- Lucide React

### Backend
- Python
- FastAPI
- Pandas

### Data Processing
- CSV
- Excel
- Pandas Data Analysis

## 📁 Project Structure

```text
DataLens/
│
├── backend/
│   └── main.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mahima311/DataLens.git
```

```bash
cd DataLens
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the backend dependencies:

```bash
pip install fastapi uvicorn pandas python-multipart openpyxl xlrd
```

Start the backend server:

```bash
python -m uvicorn main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API status |
| GET | `/health` | Health check |
| POST | `/api/analyze` | Analyze uploaded dataset |

## 🎯 Project Objective

The main objective of DataLens is to simplify the data analysis process by providing an easy-to-use platform where users can upload datasets, understand data quality, explore important statistics, and discover useful insights without performing every analysis manually.

## 🔮 Future Enhancements

- Advanced data visualization.
- More statistical analysis features.
- Improved data filtering and exploration.
- Advanced analytical reporting.

## 👩‍💻 Developer

**Mahima Mishra**

B.Tech – Computer Science & Engineering

GitHub: [@mahima311](https://github.com/mahima311)

---

⭐ If you find this project useful, consider giving it a star!
