#!/usr/bin/env python

"""
Script to initialize the database tables and data.
Can be run independently or as part of application startup.
"""

from app.db_init import main

if __name__ == "__main__":
    main() 