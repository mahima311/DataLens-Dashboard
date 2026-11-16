
from io import BytesIO
from pathlib import Path
import math

import pandas as pd

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="DataLens API",
    description="Backend API for the DataLens analytics application",
    version="1.3.0",
)

# ==========================================
# CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://data-lens-dashboard-j4ufzwa0z-mahima-mishra-s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# CONSTANTS
# ==========================================

MAX_FILE_SIZE = 10 * 1024 * 1024
SUPPORTED_EXTENSIONS = {".csv", ".xlsx", ".xls"}
MAX_CATEGORIES = 10
MAX_CHART_POINTS = 250


# ==========================================
# BASIC ROUTES
# ==========================================

@app.get("/")
def home():
    return {
        "message": "Welcome to DataLens API",
        "status": "running",
        "docs": "/docs",
    }


# ==========================================
# DATA CLEANING
# ==========================================

def clean_value(value):
    """Convert pandas, NumPy and date values into JSON-safe values."""

    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass

    if hasattr(value, "item"):
        value = value.item()

    if hasattr(value, "isoformat"):
        return value.isoformat()

    if isinstance(value, float) and not math.isfinite(value):
        return None

    if isinstance(value, (str, int, float, bool)):
        return value

    return str(value)


# ==========================================
# LOAD CSV / EXCEL
# ==========================================

def load_dataframe(filename: str, content: bytes) -> pd.DataFrame:

    extension = Path(filename).suffix.lower()

    try:
        if extension == ".csv":
            try:
                return pd.read_csv(BytesIO(content))
            except UnicodeDecodeError:
                return pd.read_csv(
                    BytesIO(content),
                    encoding="latin-1",
                )

        if extension == ".xlsx":
            return pd.read_excel(
                BytesIO(content),
                engine="openpyxl",
            )

        if extension == ".xls":
            return pd.read_excel(
                BytesIO(content),
                engine="xlrd",
            )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not read this file. Check that it is a valid "
                f"CSV or Excel file. Details: {str(exc)}"
            ),
        ) from exc

    raise HTTPException(
        status_code=400,
        detail="Unsupported file type. Upload CSV, XLSX, or XLS.",
    )


# ==========================================
# COLUMN TYPE
# ==========================================

def get_column_type(series: pd.Series) -> str:

    if pd.api.types.is_bool_dtype(series):
        return "boolean"

    if pd.api.types.is_numeric_dtype(series):
        return "numeric"

    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"

    return "categorical"


# ==========================================
# CHART DATA
# ==========================================

def get_chart_data(df: pd.DataFrame) -> dict:

    numeric_df = df.select_dtypes(include="number")

    chart_data = {
        "scatter": None,
        "histograms": {},
        "correlation": {},
        "time_series": None,
    }

    # Scatter chart
    if len(numeric_df.columns) >= 2:

        x_column = str(numeric_df.columns[0])
        y_column = str(numeric_df.columns[1])

        scatter_df = numeric_df[
            [x_column, y_column]
        ].dropna()

        if len(scatter_df) > MAX_CHART_POINTS:
            scatter_df = scatter_df.sample(
                n=MAX_CHART_POINTS,
                random_state=42,
            )

        points = [
            {
                "x": clean_value(row[x_column]),
                "y": clean_value(row[y_column]),
            }
            for _, row in scatter_df.iterrows()
        ]

        chart_data["scatter"] = {
            "x_column": x_column,
            "y_column": y_column,
            "points": points,
        }

    # Histograms
    for column in numeric_df.columns:

        series = numeric_df[column].dropna()

        if series.empty or series.nunique() <= 1:
            continue

        try:
            counts = pd.cut(
                series,
                bins=min(10, max(2, series.nunique())),
                include_lowest=True,
            ).value_counts().sort_index()

            histogram = []

            for interval, count in counts.items():

                histogram.append({
                    "label": str(interval),
                    "count": int(count),
                })

            chart_data["histograms"][str(column)] = histogram

        except Exception:
            continue

    # Correlation
    if len(numeric_df.columns) >= 2:

        corr = numeric_df.corr(numeric_only=True)

        chart_data["correlation"] = {
            str(row_name): {
                str(column_name): clean_value(
                    corr.loc[row_name, column_name]
                )
                for column_name in corr.columns
            }
            for row_name in corr.index
        }

    # Date detection
    date_column = None
    converted_dates = None

    for column in df.columns:

        if pd.api.types.is_datetime64_any_dtype(df[column]):

            date_column = column

            converted_dates = pd.to_datetime(
                df[column],
                errors="coerce",
            )

            break

        if not pd.api.types.is_numeric_dtype(df[column]):

            converted = pd.to_datetime(
                df[column],
                errors="coerce",
            )

            valid_ratio = converted.notna().mean()

            if valid_ratio >= 0.7:

                date_column = column
                converted_dates = converted
                break

    # Time series
    if date_column is not None and len(numeric_df.columns) > 0:

        value_column = numeric_df.columns[0]

        time_df = pd.DataFrame({
            "date": converted_dates,
            "value": pd.to_numeric(
                df[value_column],
                errors="coerce",
            ),
        }).dropna()

        if not time_df.empty:

            time_df["date"] = time_df["date"].dt.date

            grouped = (
                time_df.groupby("date")["value"]
                .sum()
                .sort_index()
            )

            chart_data["time_series"] = {
                "date_column": str(date_column),
                "value_column": str(value_column),
                "points": [
                    {
                        "date": str(date),
                        "value": clean_value(value),
                    }
                    for date, value in grouped.items()
                ],
            }

    return chart_data


# ==========================================
# DATASET ANALYSIS
# ==========================================

def analyze_dataset_frame(df: pd.DataFrame) -> dict:

    row_count = int(len(df))
    column_count = int(len(df.columns))

    duplicate_rows = int(df.duplicated().sum())

    missing_values = {
        str(column): int(df[column].isna().sum())
        for column in df.columns
    }

    total_missing_values = int(sum(missing_values.values()))

    numeric_df = df.select_dtypes(include="number")

    numeric_summary = {}

    for column in numeric_df.columns:

        series = numeric_df[column]

        numeric_summary[str(column)] = {
            "count": int(series.count()),
            "mean": clean_value(series.mean()),
            "min": clean_value(series.min()),
            "max": clean_value(series.max()),
            "sum": clean_value(series.sum()),
            "median": clean_value(series.median()),
            "std": clean_value(series.std()),
        }

    categorical_summary = {}
    column_profiles = {}
    insights = []

    for column in df.columns:

        series = df[column]
        column_name = str(column)

        non_null = series.dropna()

        unique_count = int(series.nunique(dropna=True))
        missing_count = int(series.isna().sum())

        column_type = get_column_type(series)

        column_profiles[column_name] = {
            "type": column_type,
            "unique_values": unique_count,
            "missing_values": missing_count,
            "missing_percentage": round(
                (missing_count / row_count) * 100,
                2,
            ) if row_count else 0,
            "non_null_count": int(series.count()),
        }

        # Categorical analysis
        if column_type in ("categorical", "boolean"):

            counts = non_null.astype(str).value_counts()

            total_non_null = int(counts.sum())

            top_categories = [
                {
                    "category": str(category),
                    "count": int(count),
                    "percentage": round(
                        (int(count) / total_non_null) * 100,
                        2,
                    ) if total_non_null else 0,
                }
                for category, count in counts.head(
                    MAX_CATEGORIES
                ).items()
            ]

            categorical_summary[column_name] = {
                "unique_values": unique_count,
                "total_non_null": total_non_null,
                "top_categories": top_categories,
                "truncated": len(counts) > MAX_CATEGORIES,
            }

            if len(counts) > 0 and total_non_null > 0:

                top_category = str(counts.index[0])
                top_count = int(counts.iloc[0])

                percentage = round(
                    top_count / total_non_null * 100,
                    2,
                )

                insights.append({
                    "type": "categorical",
                    "title": f"Most common value in {column_name}",
                    "message": (
                        f"{top_category} appears {top_count} times "
                        f"({percentage}% of non-missing values)."
                    ),
                    "column": column_name,
                })

        # Missing values
        if missing_count > 0:

            insights.append({
                "type": "missing",
                "title": f"Missing values in {column_name}",
                "message": (
                    f"{missing_count} values are missing in {column_name} "
                    f"({column_profiles[column_name]['missing_percentage']}%)."
                ),
                "column": column_name,
            })

    # Numeric insights
    for column, stats in numeric_summary.items():

        mean_value = stats["mean"]
        min_value = stats["min"]
        max_value = stats["max"]

        if mean_value is not None:

            insights.append({
                "type": "numeric",
                "title": f"Average {column}",
                "message": (
                    f"The average value of {column} is {mean_value}."
                ),
                "column": column,
                "value": mean_value,
            })

        if min_value is not None and max_value is not None:

            insights.append({
                "type": "range",
                "title": f"Range of {column}",
                "message": (
                    f"{column} ranges from {min_value} to {max_value}."
                ),
                "column": column,
                "min": min_value,
                "max": max_value,
            })

    # Duplicate insights
    if duplicate_rows > 0:

        insights.insert(0, {
            "type": "duplicates",
            "title": "Duplicate rows detected",
            "message": (
                f"The dataset contains {duplicate_rows} duplicate rows."
            ),
            "value": duplicate_rows,
        })

    else:

        insights.insert(0, {
            "type": "quality",
            "title": "No duplicate rows found",
            "message": (
                "No duplicate rows were detected in this dataset."
            ),
            "value": 0,
        })

    # Missing values insight
    if total_missing_values == 0:

        insights.insert(1, {
            "type": "quality",
            "title": "No missing values",
            "message": "All dataset cells contain values.",
            "value": 0,
        })

    # Preview
    preview_rows = df.head(10).to_dict(orient="records")

    cleaned_preview = [
        {
            str(key): clean_value(value)
            for key, value in row.items()
        }
        for row in preview_rows
    ]

    # Numeric charts
    numeric_charts = {}

    for column, stats in numeric_summary.items():

        numeric_charts[column] = [
            {"label": "Mean", "value": stats["mean"]},
            {"label": "Minimum", "value": stats["min"]},
            {"label": "Maximum", "value": stats["max"]},
            {"label": "Sum", "value": stats["sum"]},
        ]

    chart_data = get_chart_data(df)

    return {
        "success": True,
        "rows": row_count,
        "columns": column_count,
        "column_names": [str(column) for column in df.columns],
        "duplicate_rows": duplicate_rows,
        "missing_values": missing_values,
        "total_missing_values": total_missing_values,
        "numeric_summary": numeric_summary,
        "categorical_summary": categorical_summary,
        "column_profiles": column_profiles,
        "numeric_charts": numeric_charts,
        "chart_data": chart_data,
        "insights": insights,
        "preview": cleaned_preview,
    }


# ==========================================
# ANALYZE API
# ==========================================

@app.post("/api/analyze")
async def analyze_dataset(file: UploadFile = File(...)):

    filename = file.filename or ""

    extension = Path(filename).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail="Supported file types are CSV, XLSX, and XLS.",
        )

    content = await file.read()

    if not content:

        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(content) > MAX_FILE_SIZE:

        raise HTTPException(
            status_code=413,
            detail="File size must be 10 MB or less.",
        )

    df = load_dataframe(filename, content)

    if df.empty:

        raise HTTPException(
            status_code=400,
            detail="The file has no data rows to analyze.",
        )

    df.columns = [str(column) for column in df.columns]

    if df.columns.duplicated().any():

        raise HTTPException(
            status_code=400,
            detail=(
                "The dataset contains duplicate column names. "
                "Please rename them and upload the file again."
            ),
        )

    result = analyze_dataset_frame(df)

    result["filename"] = filename
    result["file_size"] = len(content)

    return result
