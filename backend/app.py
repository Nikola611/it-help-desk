from backend import create_app, socketio

app = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True)  # Use SocketIO's run method instead of app.run
