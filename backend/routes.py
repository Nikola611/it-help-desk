# backend/routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend import db
from backend.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    role = data.get('role')

    if not all([username, email, password, confirm_password, role]):
        return jsonify({'error': 'Missing fields'}), 400

    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match!'}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists!'}), 400

    pending_approval = role in ['it_helper', 'admin']

    new_user = User(username=username, email=email, role=role, pending_approval=pending_approval)
    new_user.password = password
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()

    if user and user.verify_password(password):
        if user.pending_approval:
            return jsonify({'error': 'Account pending approval'}), 403
        access_token = create_access_token(identity={'username': user.username, 'role': user.role})
        return jsonify({'access_token': access_token}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/userinfo', methods=['GET'])
@jwt_required()
def get_user_info():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    if user:
        return jsonify({'username': user.username, 'role': user.role}), 200
    return jsonify({'error': 'User not found'}), 404

@auth_bp.route('/admin/pending-accounts', methods=['GET'])
@jwt_required()
def get_pending_accounts():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    if user and user.role == 'admin':
        pending_accounts = User.query.filter_by(pending_approval=True).all()
        accounts = [{'id': u.id, 'username': u.username, 'email': u.email, 'role': u.role} for u in pending_accounts]
        return jsonify(accounts), 200
    return jsonify({'error': 'Unauthorized access'}), 403

@auth_bp.route('/admin/approve/<int:user_id>', methods=['POST'])
@jwt_required()
def approve_account(user_id):
    current_user = get_jwt_identity()
    admin_user = User.query.filter_by(username=current_user['username']).first()
    if admin_user and admin_user.role == 'admin':
        user = User.query.get(user_id)
        if user:
            user.pending_approval = False
            db.session.commit()
            return jsonify({'message': 'User approved successfully!'}), 200
    return jsonify({'error': 'Unauthorized access'}), 403

@auth_bp.route('/admin/deny/<int:user_id>', methods=['POST'])
@jwt_required()
def deny_account(user_id):
    current_user = get_jwt_identity()
    admin_user = User.query.filter_by(username=current_user['username']).first()
    if admin_user and admin_user.role == 'admin':
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return jsonify({'message': 'User denied successfully!'}), 200
    return jsonify({'error': 'Unauthorized access'}), 403
