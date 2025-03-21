FROM python:3.9

WORKDIR /app/

# Install dependencies
COPY ./requirements.txt /app/
RUN pip install -r requirements.txt

# Copy code
COPY ./ /app/

# Make scripts executable
RUN chmod +x /app/prestart.sh

# Expose the port
EXPOSE 11101

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "11101", "--loop", "uvloop", "--workers", "1"] 