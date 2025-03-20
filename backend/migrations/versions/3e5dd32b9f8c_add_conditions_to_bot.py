"""add conditions to bot

Revision ID: 3e5dd32b9f8c
Revises: 
Create Date: 2023-03-20 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.exc import ProgrammingError


# revision identifiers, used by Alembic.
revision = '3e5dd32b9f8c'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add buy_condition and sell_condition columns to bots table if they don't exist
    try:
        op.add_column('bots', sa.Column('buy_condition', sa.Text(), nullable=True))
    except ProgrammingError:
        pass  # Column already exists
    
    try:
        op.add_column('bots', sa.Column('sell_condition', sa.Text(), nullable=True))
    except ProgrammingError:
        pass  # Column already exists


def downgrade():
    # Remove buy_condition and sell_condition columns from bots table
    op.drop_column('bots', 'buy_condition')
    op.drop_column('bots', 'sell_condition') 