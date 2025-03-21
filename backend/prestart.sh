#!/bin/bash

# Wait for database to be ready
sleep 5

# Create tables directly from models
echo "Creating database tables if they don't exist..."
python initialize_db.py

# Run any other startup scripts
echo "Pre-start script completed" 