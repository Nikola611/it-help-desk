"""update ticket table

Revision ID: 6774a692622c
Revises: 6215e4f7ce4a
Create Date: 2024-08-04 12:02:39.121142

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '6774a692622c'
down_revision = '6215e4f7ce4a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('ticket', schema=None) as batch_op:
        batch_op.add_column(sa.Column('duration_set', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('scheduled_time', sa.DateTime(), nullable=True))
        batch_op.alter_column('title',
               existing_type=mysql.VARCHAR(length=120),
               type_=sa.String(length=100),
               existing_nullable=False)
        batch_op.alter_column('status',
               existing_type=mysql.VARCHAR(length=20),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('ticket', schema=None) as batch_op:
        batch_op.alter_column('status',
               existing_type=mysql.VARCHAR(length=20),
               nullable=False)
        batch_op.alter_column('title',
               existing_type=sa.String(length=100),
               type_=mysql.VARCHAR(length=120),
               existing_nullable=False)
        batch_op.drop_column('scheduled_time')
        batch_op.drop_column('duration_set')

    # ### end Alembic commands ###
