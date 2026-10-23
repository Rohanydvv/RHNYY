import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database import init_db
from app.routes import forecasts, evaluation, procurement, system

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="UK Day-Ahead Renewable Procurement & Forecast Accuracy Platform",
    description="Enterprise decision-support API for UK energy utility day-ahead wind power procurement and forecast error evaluation using Elexon BMRS data.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(forecasts.router)
app.include_router(evaluation.router)
app.include_router(procurement.router)
app.include_router(system.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "wind-procurement-analytics", "version": "1.0.0"}

# Serve static frontend build if present (for single container Docker or Heroku)
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not FRONTEND_DIST.exists():
    FRONTEND_DIST = Path("/app/frontend/dist")

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "message": "UK Day-Ahead Wind Power Procurement API is running.",
            "docs": "/docs",
            "health": "/api/health"
        }
