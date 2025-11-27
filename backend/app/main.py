from datetime import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import customers, banks, admin, auth, loan_packages
from app.services.system_monitoring import SystemMonitoringService
import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Adaptive Lending Platform...")
    
    # Start background tasks for system monitoring
    asyncio.create_task(collect_metrics_periodically())
    
    yield
    
    # Shutdown
    print("Shutting down Adaptive Lending Platform...")

async def collect_metrics_periodically():
    """Collect system metrics every 5 minutes"""
    while True:
        try:
            await SystemMonitoringService.collect_system_metrics()
        except Exception as e:
            print(f"Error collecting metrics: {e}")
        await asyncio.sleep(300)  # 5 minutes

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["Customers"])
app.include_router(banks.router, prefix="/api/v1/banks", tags=["Banks"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(loan_packages.router, prefix="/api/v1/banks", tags=["Loan Packages"])

@app.get("/")
async def root():
    return {
        "message": "Adaptive Lending Platform API",
        "version": settings.VERSION,
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}