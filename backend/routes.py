from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from backend import db, socketio
from backend.models import User, Ticket, MessageModel

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
        return jsonify({'error': 'Passwords do not match'}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 400

    pending_approval = role in ['it_helper', 'admin']

    new_user = User(username=username, email=email, role=role, pending_approval=pending_approval)
    new_user.password = password
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
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

@auth_bp.route('/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()

    if user.role != 'ticket_user':
        return jsonify({'error': 'Only ticket users can create tickets'}), 403

    data = request.get_json()

    if not data or 'title' not in data or 'description' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        new_ticket = Ticket(
            title=data['title'],
            description=data['description'],
            duration=10,  # Default duration
            user_id=user.id,
            approved_by_admin=False
        )
        db.session.add(new_ticket)
        db.session.commit()

        return jsonify({'message': 'Ticket created successfully!', 'ticket': new_ticket.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

def assign_ticket_to_helper(ticket):
    if not ticket.approved_by_admin:
        return  # Ensure tickets are only assigned after admin approval

    available_helpers = []
    for helper in User.query.filter_by(role='it_helper', pending_approval=False).all():
        available_time = find_available_time(helper, ticket.duration)
        if available_time:
            available_helpers.append((helper, available_time))

    # Sort by the earliest available time
    if available_helpers:
        # Assign the ticket to the helper with the earliest available time
        earliest_helper = min(available_helpers, key=lambda x: x[1])
        ticket.assigned_to = earliest_helper[0].id
        ticket.scheduled_time = earliest_helper[1]
        ticket.status = 'Assigned'
        db.session.commit()

def find_available_time(helper, duration):
    work_start = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
    work_end = datetime.now().replace(hour=17, minute=0, second=0, microsecond=0)

    # Fetch all tickets assigned to the helper, sorted by scheduled time
    tickets = Ticket.query.filter_by(assigned_to=helper.id).order_by(Ticket.scheduled_time).all()

    current_time = work_start
    for ticket in tickets:
        if ticket.scheduled_time is None:
            continue

        if ticket.scheduled_time >= work_end:
            break

        # Calculate the end time of the current ticket
        end_time = ticket.scheduled_time + timedelta(minutes=ticket.duration)
        if (ticket.scheduled_time - current_time).total_seconds() / 60 >= duration:
            return current_time

        current_time = end_time

    # Check for a slot at the end of the day
    if (work_end - current_time).total_seconds() / 60 >= duration:
        return current_time

    return None

@auth_bp.route('/tickets/assigned', methods=['GET'])
@jwt_required()
def get_assigned_tickets():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()

    if user.role != 'it_helper':
        return jsonify({'error': 'Unauthorized access'}), 403

    tickets = Ticket.query.filter_by(assigned_to=user.id).all()
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'duration': t.duration,
        'scheduled_time': t.scheduled_time.isoformat() if t.scheduled_time else None,
        'status': t.status
    } for t in tickets]), 200

@auth_bp.route('/admin/pending-accounts', methods=['GET'])
@jwt_required()
def get_pending_accounts():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    if user and user.role == 'admin':
        pending_accounts = User.query.filter_by(pending_approval=True).all()
        return jsonify([{'id': u.id, 'username': u.username, 'email': u.email, 'role': u.role} for u in pending_accounts]), 200
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
            return jsonify({'message': 'User approved successfully'}), 200
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
            return jsonify({'message': 'User denied successfully'}), 200
    return jsonify({'error': 'Unauthorized access'}), 403

@auth_bp.route('/admin/tickets/update-time/<int:ticket_id>', methods=['POST'])
@jwt_required()
def update_ticket_time(ticket_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()

    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.get_json()
    new_duration = data.get('duration')

    if new_duration is None:
        return jsonify({'error': 'Duration is required'}), 400

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404

    # Update ticket duration and mark duration_set as True to indicate admin has set it
    ticket.duration = new_duration
    ticket.duration_set = True
    db.session.commit()

    # Optionally reassign the ticket based on the new duration if necessary
    assign_ticket_to_helper(ticket)

    return jsonify({'message': 'Ticket duration updated and marked as set by admin'}), 200

def reassign_ticket(ticket):
    helpers = User.query.filter_by(role='it_helper', pending_approval=False).all()

    for helper in helpers:
        available_time = find_available_time(helper, ticket.duration)
        if available_time:
            ticket.assigned_to = helper.id
            ticket.scheduled_time = available_time
            db.session.commit()
            return

@auth_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket_details(ticket_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()

    ticket = Ticket.query.filter_by(id=ticket_id).first()

    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404

    if user.role == 'it_helper' and ticket.assigned_to != user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    if user.role == 'ticket_user' and ticket.user_id != user.id:
        return jsonify({'error': 'Unauthorized access'}), 403

    ticket_detail = {
        'id': ticket.id,
        'title': ticket.title,
        'description': ticket.description,
        'duration': ticket.duration,
        'scheduled_time': ticket.scheduled_time.isoformat() if ticket.scheduled_time else None,
        'status': ticket.status
    }

    messages = [
        {
            'sender': msg.sender.username,
            'text': msg.text,
            'timestamp': msg.timestamp.isoformat()
        }
        for msg in MessageModel.query.filter_by(ticket_id=ticket.id).all()
    ]

    return jsonify(ticket=ticket_detail, messages=messages, role=user.role), 200

@auth_bp.route('/tickets/user-submitted', methods=['GET'])
@jwt_required()
def get_user_submitted_tickets():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    tickets = Ticket.query.filter_by(user_id=user.id).all()
    if tickets:
        tickets_data = [{
            'id': ticket.id,
            'title': ticket.title,
            'description': ticket.description
        } for ticket in tickets]
        return jsonify(tickets=tickets_data), 200
    else:
        return jsonify({'error': 'No tickets submitted by this user'}), 404

@auth_bp.route('/tickets/<int:ticket_id>/messages', methods=['GET'])
@jwt_required()
def get_ticket_messages(ticket_id):
    messages = MessageModel.query.filter_by(ticket_id=ticket_id).all()
    messages_data = [{
        'text': msg.text,
        'sender': msg.sender.username,
        'timestamp': msg.timestamp.isoformat()
    } for msg in messages]
    return jsonify(messages_data), 200

@auth_bp.route('/tickets/<int:ticket_id>/chat', methods=['POST'])
@jwt_required()
def send_chat_message(ticket_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()

    data = request.get_json()
    message_text = data.get('message')

    if not message_text:
        return jsonify({'error': 'Message text is required'}), 400

    new_message = MessageModel(
        text=message_text,
        ticket_id=ticket_id,
        sender_id=user.id
    )

    db.session.add(new_message)
    db.session.commit()

    socketio.emit('receive_message', {
        'text': message_text,
        'sender': user.username,
        'ticket_id': ticket_id,
        'timestamp': new_message.timestamp.isoformat()
    }, room=ticket_id)

    return jsonify({'message': 'Message sent successfully'}), 201

@auth_bp.route('/admin/tickets', methods=['GET'])
@jwt_required()
def get_pending_tickets():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()

    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    tickets = Ticket.query.filter_by(approved_by_admin=False).all()
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'duration': t.duration,
        'scheduled_time': t.scheduled_time.isoformat() if t.scheduled_time else None,
        'status': t.status
    } for t in tickets]), 200

@auth_bp.route('/admin/tickets/approve/<int:ticket_id>', methods=['POST'])
@jwt_required()
def approve_ticket(ticket_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()

    if user.role != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404

    data = request.get_json()
    time_estimate = data.get('time_estimate')

    if time_estimate is None or time_estimate <= 0:
        return jsonify({'error': 'A valid time estimate is required'}), 400

    ticket.approved_by_admin = True
    ticket.time_estimate = time_estimate
    ticket.duration = time_estimate
    ticket.status = 'Approved'
    db.session.commit()

    assign_ticket_to_helper(ticket)

    return jsonify({'message': 'Ticket approved and assigned successfully'}), 200

@auth_bp.route('/tickets/approve-and-delete/<int:ticket_id>', methods=['POST'])
@jwt_required()
def approve_and_delete_ticket(ticket_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()

    if user.role != 'ticket_user':
        return jsonify({'error': 'Unauthorized access'}), 403

    ticket = Ticket.query.get(ticket_id)
    if not ticket or ticket.user_id != user.id:
        return jsonify({'error': 'Ticket not found or not authorized'}), 404

    # Optional: Perform any cleanup or finalization here before deleting the ticket

    db.session.delete(ticket)
    db.session.commit()

    return jsonify({'message': 'Ticket approved and deleted successfully'}), 200

@auth_bp.route('/it-helpers', methods=['GET'])
@jwt_required()
def list_it_helpers():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user['username']).first()

        if user and user.role == 'admin':
            it_helpers = User.query.filter_by(role='it_helper').all()
            return jsonify([{
                'id': helper.id,
                'username': helper.username
            } for helper in it_helpers]), 200
        else:
            return jsonify({'error': 'Unauthorized access'}), 403
    except Exception as e:
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500

@auth_bp.route('/it-helper-schedule/<int:helper_id>', methods=['GET'])
@jwt_required()
def get_it_helper_schedule(helper_id):
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user['username']).first()

        if user and user.role == 'admin':
            tickets = Ticket.query.filter_by(assigned_to=helper_id).all()
            return jsonify([{
                'id': ticket.id,
                'title': ticket.title,
                'description': ticket.description,
                'start': ticket.scheduled_time.isoformat() if ticket.scheduled_time else None,
                'end': (ticket.scheduled_time + timedelta(minutes=ticket.duration)).isoformat() if ticket.scheduled_time else None,
                'status': ticket.status
            } for ticket in tickets]), 200
        else:
            return jsonify({'error': 'Unauthorized access'}), 403
    except Exception as e:
        return jsonify({'error': 'An error occurred: ' + str(e)}), 500