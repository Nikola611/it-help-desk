from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from flask_socketio import SocketIO, join_room, emit
from backend.config import Config

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins='*')  # Allow CORS for all origins

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)

    CORS(app)

    # Register blueprints
    from backend.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    return app

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_room')
def on_join(data):
    room = data['ticket_id']
    join_room(room)
    print(f"User joined room: {room}")

@socketio.on('send_message')
def handle_message(data):
    room = data['ticket_id']
    emit('receive_message', data, to=room)
