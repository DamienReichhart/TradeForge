from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    bots,
    subscriptions,
    indicators,
    backtests,
    performance,
    marketing,
    health
)

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(bots.router, prefix="/bots", tags=["bots"])
api_router.include_router(indicators.router, prefix="/indicators", tags=["indicators"])
api_router.include_router(backtests.router, prefix="/backtests", tags=["backtests"])
api_router.include_router(performance.router, prefix="/performance", tags=["performance"])
api_router.include_router(marketing.router, prefix="/marketing", tags=["marketing"])
api_router.include_router(health.router, prefix="/health", tags=["health"]) 