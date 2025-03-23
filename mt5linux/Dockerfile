# Use Ubuntu 22.04 as base image
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create directories to match expected directory structure
RUN mkdir -p "/root/.wine/drive_c/Program Files/MetaTrader 5/config" \
    && mkdir -p "/root/.wine/drive_c/users/root/AppData/Roaming/MetaQuotes/Terminal/D0E8209F77C8CF37AD8BF550E51FF075/MQL5"

# Copy server script
COPY mt5server.py /app/mt5server.py
RUN chmod +x /app/mt5server.py

# Create startup script
RUN echo '#!/bin/bash\n\
echo "Starting mt5linux placeholder server..."\n\
python3 /app/mt5server.py\n\
' > /start.sh \
&& chmod +x /start.sh

# Expose port for mt5linux server
EXPOSE 8222

# Command to run
CMD ["/start.sh"]
