from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from api.models import db, User, Transaction, Payment, Employee, Project, Budget
from api.utils import APIException
from datetime import datetime
import requests

api = Blueprint('api', __name__)

@api.route('/login', methods=['POST'])
def login():
    if not request.is_json:
        raise APIException("El tipo de contenido debe ser JSON", status_code=415)

    data = request.json
    if not data.get("email") or not data.get("password"):
        raise APIException("Faltan campos obligatorios (email, password)", status_code=400)

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        raise APIException("Credenciales inválidas", status_code=401)

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"token": access_token, "user_id": user.id}), 200

@api.route('/register', methods=['POST'])
def register():
    data = request.json
    if not all([data.get(field) for field in ["name", "company", "email", "password"]]):
        raise APIException("Faltan campos obligatorios (name, company, email, password)", status_code=400)

    if User.query.filter_by(email=data['email']).first():
        raise APIException("El correo ya está registrado", status_code=400)

    user = User(
        name=data['name'],
        company=data['company'],
        industry=data.get('industry'),
        email=data['email']
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    return jsonify(user.serialize()), 201

@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

@api.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    print(f"ID recibido user: {user_id}")
    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)
    return jsonify(user.serialize()), 200

@api.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)

    data = request.json
    user.name = data.get("name", user.name)
    user.company = data.get("company", user.company)
    user.industry = data.get("industry", user.industry)
    if data.get("password"):
        user.set_password(data['password'])

    db.session.commit()
    return jsonify(user.serialize()), 200

@api.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"Usuario con ID {user_id} eliminado correctamente"}), 200

@api.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.json
    if not all([data.get(field) for field in ["amount", "transaction_type", "status"]]):
        raise APIException("Faltan campos obligatorios (amount, transaction_type, status)", status_code=400)

    transaction = Transaction(
        user_id=user_id,
        amount=data['amount'],
        description=data.get('description', ""),
        transaction_type=data['transaction_type'],
        status=data['status'],
        company=data.get('company'),
        date=datetime.utcnow()
    )
    db.session.add(transaction)
    db.session.commit()
    return jsonify(transaction.serialize()), 201

@api.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    return jsonify([transaction.serialize() for transaction in transactions]), 200

@api.route('/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    current_user_id = get_jwt_identity()
    
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        raise APIException("Transacción no encontrada", status_code=404)

    if int(transaction.user_id) != int(current_user_id):
        raise APIException("No tienes permiso para modificar esta transacción", status_code=403)

    data = request.json

    transaction.amount = data.get("amount", transaction.amount)
    transaction.description = data.get("description", transaction.description)
    transaction.transaction_type = data.get("transaction_type", transaction.transaction_type)
    transaction.status = data.get("status", transaction.status)
    transaction.company = data.get("company", transaction.company)

    if "date" in data:
        try:
            transaction.date = datetime.strptime(data["date"], "%Y-%m-%d")
        except ValueError:
            raise APIException("Formato de fecha inválido. Debe ser 'YYYY-MM-DD'", status_code=400)

    db.session.commit()
    return jsonify(transaction.serialize()), 200

@api.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.get(transaction_id)
    if not transaction or int(transaction.user_id) != int(user_id):
        raise APIException("Transacción no encontrada o no autorizada", status_code=403)

    db.session.delete(transaction)
    db.session.commit()
    return jsonify({"message": f"Transacción con ID {transaction_id} eliminada correctamente"}), 200

@api.route('/employees', methods=['POST'])
@jwt_required()
def create_employee():
    user_id = get_jwt_identity()
    data = request.json
    if not all([data.get(field) for field in ["name", "salary"]]):
        raise APIException("Faltan campos obligatorios (name, salary)", status_code=400)

    employee = Employee(
        user_id=user_id,
        name=data['name'],
        salary=data['salary'],
        position=data.get('position')
    )
    db.session.add(employee)
    db.session.commit()
    return jsonify(employee.serialize()), 201

@api.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    user_id = get_jwt_identity()
    employees = Employee.query.filter_by(user_id=user_id).all()
    return jsonify([employee.serialize() for employee in employees]), 200

@api.route('/employees/<int:employee_id>', methods=['PUT'])
@jwt_required()
def update_employee(employee_id):
    user_id = get_jwt_identity()
    employee = Employee.query.get(employee_id)
    if not employee or int(employee.user_id) != int(user_id):
        raise APIException("Empleado no encontrado o no autorizado", status_code=403)

    data = request.json
    employee.name = data.get("name", employee.name)
    employee.salary = data.get("salary", employee.salary)
    employee.position = data.get("position", employee.position)

    db.session.commit()
    return jsonify(employee.serialize()), 200

@api.route('/employees/<int:employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    user_id = get_jwt_identity()
    employee = Employee.query.get(employee_id)
    if not employee or int(employee.user_id) != int(user_id):
        raise APIException("Empleado no encontrado o no autorizado", status_code=403)

    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message": f"Empleado con ID {employee_id} eliminado correctamente"}), 200

@api.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.json
    if not all([data.get(field) for field in ["name", "description", "client"]]):
        raise APIException("Faltan campos obligatorios (name, description, client)", status_code=400)

    project = Project(
        user_id=user_id,
        name=data['name'],
        description=data['description'],
        client=data['client'],
        start_date=datetime.utcnow(),
        end_date=data.get('end_date')
    )
    db.session.add(project)
    db.session.commit()
    return jsonify(project.serialize()), 201

@api.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = get_jwt_identity()
    projects = Project.query.filter_by(user_id=user_id).all()
    return jsonify([project.serialize() for project in projects]), 200

@api.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    if not project or int(project.user_id) != int(user_id):
        raise APIException("Proyecto no encontrado o no autorizado", status_code=403)

    data = request.json
    project.name = data.get("name", project.name)
    project.description = data.get("description", project.description)
    project.client = data.get("client", project.client)
    if data.get("end_date"):
        try:
            project.end_date = datetime.strptime(data["end_date"], "%Y-%m-%d")
        except ValueError:
            raise APIException("Formato de fecha inválido. Debe ser 'YYYY-MM-DD'", status_code=400)

    db.session.commit()
    return jsonify(project.serialize()), 200

@api.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    if not project or int(project.user_id) != int(user_id):
        raise APIException("Proyecto no encontrado o no autorizado", status_code=403)

    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": f"Proyecto con ID {project_id} eliminado correctamente"}), 200

@api.route('/budgets', methods=['POST'])
@jwt_required()
def create_budget():
    user_id = get_jwt_identity()
    data = request.json
    if not all([data.get(field) for field in ["project_id", "amount", "status"]]):
        raise APIException("Faltan campos obligatorios (project_id, amount, status)", status_code=400)

    project = Project.query.get(data['project_id'])
    if not project or int(project.user_id) != int(user_id):
        raise APIException("Proyecto no encontrado o no autorizado", status_code=403)

    budget = Budget(
        user_id=user_id,
        project_id=data['project_id'],
        description=data.get('description', ""),
        amount=data['amount'],
        status=data['status'],
        date=datetime.utcnow()
    )
    db.session.add(budget)
    db.session.commit()
    return jsonify(budget.serialize()), 201

@api.route('/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()
    budgets = Budget.query.filter_by(user_id=user_id).all()
    return jsonify([budget.serialize() for budget in budgets]), 200

@api.route('/budgets/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    user_id = get_jwt_identity()
    budget = Budget.query.get(budget_id)
    if not budget or int(budget.user_id) != int(user_id):
        raise APIException("Presupuesto no encontrado o no autorizado", status_code=403)

    data = request.json
    budget.amount = data.get("amount", budget.amount)
    budget.status = data.get("status", budget.status)
    budget.description = data.get("description", budget.description)

    db.session.commit()
    return jsonify(budget.serialize()), 200

@api.route('/budgets/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    user_id = get_jwt_identity()
    budget = Budget.query.get(budget_id)
    if not budget or int(budget.user_id) != int(user_id):
        raise APIException("Presupuesto no encontrado o no autorizado", status_code=403)

    db.session.delete(budget)
    db.session.commit()
    return jsonify({"message": f"Presupuesto con ID {budget_id} eliminado correctamente"}), 200

@api.route('/chart', methods=['GET'])
@jwt_required()
def generate_chart():
    user_id = get_jwt_identity()
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Transaction.query.filter_by(user_id=user_id)

    if start_date:
        try:
            start_date_parsed = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Transaction.date >= start_date_parsed)
        except ValueError:
            raise APIException("Formato de fecha inválido para start_date. Debe ser 'YYYY-MM-DD'", status_code=400)

    if end_date:
        try:
            end_date_parsed = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(Transaction.date <= end_date_parsed)
        except ValueError:
            raise APIException("Formato de fecha inválido para end_date. Debe ser 'YYYY-MM-DD'", status_code=400)

    transactions = query.all()

    if not transactions:
        raise APIException("No se encontraron transacciones en el rango de fechas proporcionado", status_code=404)

    chart_data = Transaction.transform_for_chart(transactions)

    try:
        response = requests.post("https://quickchart.io/chart/create", json=chart_data)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.RequestException as e:
        raise APIException(f"Error al generar el gráfico: {str(e)}", status_code=500)
