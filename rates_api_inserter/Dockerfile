# Use ubuntu:22.04 as base image
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install necessary dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    gcc \
    g++ \
    build-essential \
    libffi-dev \
    ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /app

# Copy application files
COPY requirements.txt .
COPY inserter.py .
COPY .env .

# Install Python dependencies without mt5linux
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir wheel setuptools && \
    pip3 install --no-cache-dir -r requirements.txt

# Create a placeholder for the mt5linux package with client module
RUN mkdir -p /app/mt5linux && \
    echo '# MT5 constants\n\
TIMEFRAME_M1 = 1\n\
TIMEFRAME_M5 = 5\n\
TIMEFRAME_M15 = 15\n\
TIMEFRAME_M30 = 30\n\
TIMEFRAME_H1 = 60\n\
TIMEFRAME_H4 = 240\n\
TIMEFRAME_D1 = 1440\n\
TIMEFRAME_W1 = 10080\n\
TIMEFRAME_MN1 = 43200\n\
\n\
class MockClient:\n\
    def __init__(self):\n\
        self.TIMEFRAME_M1 = TIMEFRAME_M1\n\
        self.TIMEFRAME_M5 = TIMEFRAME_M5\n\
        self.TIMEFRAME_M15 = TIMEFRAME_M15\n\
        self.TIMEFRAME_M30 = TIMEFRAME_M30\n\
        self.TIMEFRAME_H1 = TIMEFRAME_H1\n\
        self.TIMEFRAME_H4 = TIMEFRAME_H4\n\
        self.TIMEFRAME_D1 = TIMEFRAME_D1\n\
        self.TIMEFRAME_W1 = TIMEFRAME_W1\n\
        self.TIMEFRAME_MN1 = TIMEFRAME_MN1\n\
\n\
    def connect(self, host, port):\n\
        print(f"Mock MT5 connecting to {host}:{port}")\n\
        return True\n\
\n\
    def disconnect(self):\n\
        print("Mock MT5 disconnecting")\n\
        return True\n\
\n\
client = MockClient()\n\
' > /app/mt5linux/client.py && \
    echo 'from mt5linux.client import *' > /app/mt5linux/__init__.py

# Create startup script for the inserter
RUN echo '#!/bin/bash\n\
\n\
cd /app\n\
echo "Starting MetaTrader5 inserter..."\n\
python3 /app/inserter.py\n\
' > /app/start.sh \
&& chmod +x /app/start.sh

# Export PYTHONPATH to include the current directory
ENV PYTHONPATH=/app

# Command to run
CMD ["/app/start.sh"] 