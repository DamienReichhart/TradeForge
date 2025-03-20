import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database connection details from environment variables
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_SERVER = os.getenv("POSTGRES_SERVER", "postgres")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "postgres")

# Create database URL
DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Create database engine
engine = create_engine(DATABASE_URL)

def fix_indicators_table():
    print("Checking and fixing indicators table...")
    with engine.connect() as conn:
        # Check if type column exists
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='indicators' AND column_name='type'"
        ))
        has_type_column = result.fetchone() is not None
        
        if not has_type_column:
            print("Adding 'type' column to indicators table...")
            # Add type column
            conn.execute(text("ALTER TABLE indicators ADD COLUMN type VARCHAR"))
            
            # Update type column to match name
            conn.execute(text("UPDATE indicators SET type = name WHERE type IS NULL"))
            
            # Make type column not nullable
            conn.execute(text("ALTER TABLE indicators ALTER COLUMN type SET NOT NULL"))
            
            print("Column 'type' added successfully!")
        else:
            print("Column 'type' already exists in indicators table.")
        
        conn.commit()
        
if __name__ == "__main__":
    fix_indicators_table()
    print("Done!") 