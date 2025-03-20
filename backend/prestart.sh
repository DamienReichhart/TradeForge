#!/bin/bash

# Wait for database to be ready
sleep 5

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Initialize data
echo "Initializing data..."
python -m app.initial_data

# Run any other startup scripts
echo "Pre-start script completed" 