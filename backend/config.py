# backend/config.py
import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql://root:CEN3031@34.46.43.14/it_help_desk'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.urandom(24)
