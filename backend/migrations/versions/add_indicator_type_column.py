"""add type column to indicators table

Revision ID: 4f7e9a2b1d3c
Revises: 3e5dd32b9f8c
Create Date: 2025-03-20 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.exc import ProgrammingError
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision = '4f7e9a2b1d3c'
down_revision = '3e5dd32b9f8c'
branch_labels = None
depends_on = None


def upgrade():
    # Check if column exists
    try:
        conn = op.get_bind()
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='indicators' AND column_name='type'"))
        has_type_column = result.fetchone() is not None
    except:
        has_type_column = False
    
    if not has_type_column:
        # Add type column to indicators table
        op.add_column('indicators', sa.Column('type', sa.String(), nullable=True))
        
        # Update existing indicators to set type = name
        op.execute("""
        UPDATE indicators 
        SET type = name 
        WHERE type IS NULL
        """)
        
        # Make type column not nullable
        op.alter_column('indicators', 'type', nullable=False)


def downgrade():
    # Remove type column from indicators table
    try:
        op.drop_column('indicators', 'type')
    except:
        pass 