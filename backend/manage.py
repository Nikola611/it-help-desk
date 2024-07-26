# backend/manage.py
from backend import create_app, db
from flask_migrate import Migrate
from backend.models import User

app = create_app()
migrate = Migrate(app, db)

if __name__ == '__main__':
    app.run(debug=True)
