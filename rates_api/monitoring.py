from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import FastAPI, Response
from influxdb_client import InfluxDBClient
from config import get_settings

settings = get_settings()

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

DB_CONNECTION_STATUS = Gauge(
    'db_connection_status',
    'Database connection status (1=connected, 0=disconnected)'
)

def setup_monitoring(app: FastAPI):
    @app.middleware("http")
    async def monitor_requests(request, call_next):
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status="pending"
        ).inc()
        
        with REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=request.url.path
        ).time():
            response = await call_next(request)
            
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=str(response.status_code)
        ).inc()
        
        return response

    @app.get("/metrics")
    async def metrics():
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

    @app.get("/health")
    async def health_check():
        try:
            # Check InfluxDB connection
            client = InfluxDBClient(
                url=settings.INFLUXDB_URL,
                token=settings.INFLUXDB_TOKEN,
                org=settings.INFLUXDB_ORG
            )
            health = client.health()
            client.close()
            
            if health.status == "pass":
                DB_CONNECTION_STATUS.set(1)
                return {
                    "status": "healthy",
                    "database": "connected",
                    "timestamp": health.time
                }
            else:
                DB_CONNECTION_STATUS.set(0)
                return {
                    "status": "unhealthy",
                    "database": "disconnected",
                    "error": health.message
                }
        except Exception as e:
            DB_CONNECTION_STATUS.set(0)
            return {
                "status": "unhealthy",
                "database": "error",
                "error": str(e)
            }