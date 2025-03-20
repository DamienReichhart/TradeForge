#!/bin/bash

# Run migrations
python -m app.initial_data

# Run any other startup scripts
echo "Pre-start script completed" 