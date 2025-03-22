from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import ASYNCHRONOUS
from tenacity import retry, stop_after_attempt, wait_exponential

from config import get_settings
from security import RateLimitMiddleware
from auth import authenticate_user, create_access_token, get_current_user, Token, USERS
from monitoring import setup_monitoring

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Setup monitoring
setup_monitoring(app)

# Setup rate limiting
app.add_middleware(
    RateLimitMiddleware,
    requests_per_minute=settings.RATE_LIMIT_PER_MINUTE
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize InfluxDB client with retry logic
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def get_influx_client():
    client = InfluxDBClient(
        url=settings.INFLUXDB_URL,
        token=settings.INFLUXDB_TOKEN,
        org=settings.INFLUXDB_ORG
    )
    # Test connection
    client.health()
    return client

influx_client = get_influx_client()
write_api = influx_client.write_api(write_options=ASYNCHRONOUS)
query_api = influx_client.query_api()

class DataPoint(BaseModel):
    symbol: str
    timeframe: str
    time: datetime
    open: float
    high: float
    low: float
    close: float
    tick_volume: int
    spread: int
    real_volume: int

# Add token endpoint for authentication
@app.post(f"{settings.API_V1_STR}/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(USERS, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post(f"{settings.API_V1_STR}/data")
async def insert_data(
    points: List[DataPoint],
    current_user: str = Depends(get_current_user)
):
    try:
        influx_points = []
        for point in points:
            p = (
                Point("mt5_data")
                .tag("symbol", point.symbol)
                .tag("timeframe", point.timeframe)
                .field("open", point.open)
                .field("high", point.high)
                .field("low", point.low)
                .field("close", point.close)
                .field("tick_volume", point.tick_volume)
                .field("spread", point.spread)
                .field("real_volume", point.real_volume)
                .time(point.time)
            )
            influx_points.append(p)
        
        write_api.write(bucket=settings.INFLUXDB_BUCKET, org=settings.INFLUXDB_ORG, record=influx_points)
        return {"status": "success", "points_written": len(influx_points)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write data: {str(e)}"
        )

@app.get(f"{settings.API_V1_STR}/data/last")
async def get_last(
    symbol: str,
    timeframe: str,
    current_user: str = Depends(get_current_user)
):
    query = f'''
    from(bucket:"{settings.INFLUXDB_BUCKET}")
      |> range(start: 0)
      |> filter(fn: (r) => r["_measurement"] == "mt5_data")
      |> filter(fn: (r) => r["symbol"] == "{symbol}" and r["timeframe"] == "{timeframe}")
      |> last()
    '''
    try:
        result = query_api.query(org=settings.INFLUXDB_ORG, query=query)
        last_time = None
        for table in result:
            for record in table.records:
                last_time = record.get_time()
        return {"last_time": last_time}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query data: {str(e)}"
        )

@app.get(f"{settings.API_V1_STR}/data")
async def get_data(
    symbol: str,
    timeframe: str,
    start: datetime,
    end: datetime,
    current_user: str = Depends(get_current_user)
):
    query = f'''
    from(bucket:"{settings.INFLUXDB_BUCKET}")
      |> range(start: {start.isoformat()}, stop: {end.isoformat()})
      |> filter(fn: (r) => r["_measurement"] == "mt5_data")
      |> filter(fn: (r) => r["symbol"] == "{symbol}" and r["timeframe"] == "{timeframe}")
    '''
    try:
        result = query_api.query(org=settings.INFLUXDB_ORG, query=query)
        data = []
        for table in result:
            for record in table.records:
                data.append({
                    "time": record.get_time(),
                    "symbol": record.values.get("symbol"),
                    "timeframe": record.values.get("timeframe"),
                    "field": record.get_field(),
                    "value": record.get_value()
                })
        return {"data": data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query data: {str(e)}"
        )

@app.on_event("shutdown")
async def shutdown_event():
    write_api.close()
    influx_client.close()
