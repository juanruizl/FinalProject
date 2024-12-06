from flask import Blueprint, jsonify, request
from api.models import db, User, Transaction, Payment, Project, Budget, Employee
from api.utils import APIException
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

# --------------------------------------------
# Rutas de Autenticación
# --------------------------------------------
@api.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data.get("email") or not data.get("password"):
        raise APIException("Faltan campos obligatorios (email, password)", status_code=400)

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        raise APIException("Credenciales inválidas", status_code=401)

    # Generar token de acceso
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"token": access_token, "user_id": user.id}), 200

@api.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)

    return jsonify({"message": f"Hola, {user.name}! Esta es una ruta protegida."}), 200

# --------------------------------------------
# Rutas para Usuarios
# --------------------------------------------
@api.route('/users', methods=['POST'])
def create_user():
    """Crear un nuevo usuario"""
    data = request.json
    if not data.get("name") or not data.get("company") or not data.get("industry") or not data.get("email") or not data.get("password"):
        raise APIException("Faltan campos obligatorios (name, company, email, password)", status_code=400)

    if User.query.filter_by(email=data['email']).first():
        raise APIException("El correo ya está registrado", status_code=400)

    new_user = User(name=data['name'], company=data['company'], industry=data['industry'], email=data['email'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.serialize()), 201

@api.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Obtener un usuario por su ID"""
    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)
    return jsonify(user.serialize()), 200

@api.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Actualizar un usuario"""
    current_user_id = get_jwt_identity()
    if int(current_user_id) != user_id:
        raise APIException("No tienes permiso para actualizar este usuario", status_code=403)

    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)

    data = request.json
    user.name = data.get("name", user.name)
    user.company = data.get("company", user.company)
    user.industry = data.get("industry", user.industry)
    if 'password' in data:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify(user.serialize()), 200

@api.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Eliminar un usuario"""
    current_user_id = get_jwt_identity()
    if int(current_user_id) != user_id:
        raise APIException("No tienes permiso para eliminar este usuario", status_code=403)

    user = User.query.get(user_id)
    if not user:
        raise APIException("Usuario no encontrado", status_code=404)

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"Usuario con ID {user_id} eliminado correctamente"}), 200

# --------------------------------------------
# Rutas para Transacciones
# --------------------------------------------
@api.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    """Crear una nueva transacción"""
    current_user_id = get_jwt_identity()
    data = request.json
    if not data.get("amount") or not data.get("transaction_type") or not data.get("status"):
        raise APIException("Faltan campos obligatorios (amount, transaction_type, status)", status_code=400)

    new_transaction = Transaction(
        user_id=current_user_id,
        amount=data['amount'],
        description=data.get('description', ""),
        transaction_type=data['transaction_type'],
        status=data['status'],
        company=data.get('company', None)
    )
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify(new_transaction.serialize()), 201

@api.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """Obtener todas las transacciones del usuario actual"""
    current_user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=current_user_id).all()
    return jsonify([transaction.serialize() for transaction in transactions]), 200

@api.route('/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    """Actualizar una transacción"""
    current_user_id = get_jwt_identity()
    print(f"Usuario autenticado: {current_user_id}")
    
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        print(f"Transacción con ID {transaction_id} no encontrada.")
        raise APIException("Transacción no encontrada", status_code=404)

    if int(transaction.user_id) != int(current_user_id):
        print(f"Transacción no autorizada. Usuario actual: {current_user_id}, Usuario transacción: {transaction.user_id}")
        raise APIException("No tienes permiso para modificar esta transacción", status_code=403)

    data = request.json
    print(f"Datos recibidos para actualización: {data}")
    
    transaction.amount = data.get("amount", transaction.amount)
    transaction.description = data.get("description", transaction.description)
    transaction.status = data.get("status", transaction.status)

    db.session.commit()
    print(f"Transacción actualizada con éxito: {transaction.serialize()}")
    
    return jsonify(transaction.serialize()), 200


@api.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    """Eliminar una transacción"""
    current_user_id = get_jwt_identity()
    transaction = Transaction.query.get(transaction_id)
    if not transaction or int(transaction.user_id) != int(current_user_id):
        raise APIException("Transacción no encontrada o no autorizada", status_code=404)

    db.session.delete(transaction)
    db.session.commit()
    return jsonify({"message": f"Transacción con ID {transaction_id} eliminada correctamente"}), 200

# --------------------------------------------
# Rutas para Pagos (Payments)
# --------------------------------------------
@api.route('/payments', methods=['POST'])
@jwt_required()
def create_payment():
    """Crear un nuevo pago"""
    current_user_id = get_jwt_identity()
    data = request.json
    if not data.get("amount") or not data.get("recipient"):
        raise APIException("Faltan campos obligatorios (amount, recipient)", status_code=400)

    new_payment = Payment(
        user_id=current_user_id,
        amount=data['amount'],
        recipient=data['recipient'],
        status=data.get("status", "pending")  # Estado predeterminado: pendiente
    )
    db.session.add(new_payment)
    db.session.commit()
    return jsonify(new_payment.serialize()), 201

@api.route('/payments', methods=['GET'])
@jwt_required()
def get_payments():
    """Obtener todos los pagos del usuario actual"""
    current_user_id = get_jwt_identity()
    payments = Payment.query.filter_by(user_id=current_user_id).all()
    return jsonify([payment.serialize() for payment in payments]), 200

@api.route('/payments/<int:payment_id>', methods=['PUT'])
@jwt_required()
def update_payment(payment_id):
    """Actualizar un pago"""
    current_user_id = get_jwt_identity()
    payment = Payment.query.get(payment_id)
    if not payment or int(payment.user_id) != int(current_user_id):
        raise APIException("Pago no encontrado o no autorizado", status_code=404)

    data = request.json
    payment.amount = data.get("amount", payment.amount)
    payment.recipient = data.get("recipient", payment.recipient)
    payment.status = data.get("status", payment.status)

    db.session.commit()
    return jsonify(payment.serialize()), 200

@api.route('/payments/<int:payment_id>', methods=['DELETE'])
@jwt_required()
def delete_payment(payment_id):
    """Eliminar un pago"""
    current_user_id = get_jwt_identity()
    payment = Payment.query.get(payment_id)
    if not payment or int(payment.user_id) != int(current_user_id):
        raise APIException("Pago no encontrado o no autorizado", status_code=404)

    db.session.delete(payment)
    db.session.commit()
    return jsonify({"message": f"Pago con ID {payment_id} eliminado correctamente"}), 200

# --------------------------------------------
# Rutas para Proyectos (Projects)
# --------------------------------------------
@api.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    """Crear un nuevo proyecto"""
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        # Validar campos obligatorios
        if not data.get("name") or not data.get("description") or not data.get("client"):
            raise APIException("Faltan campos obligatorios (name, description, client)", status_code=400)

        # Crear nuevo proyecto
        new_project = Project(
            user_id=current_user_id,
            name=data['name'],
            description=data['description'],
            client=data['client'],
            start_date=data.get('start_date'),
            end_date=data.get('end_date')
        )

        db.session.add(new_project)
        db.session.commit()

        return jsonify(new_project.serialize()), 201

    except Exception as e:
        print(f"Error al crear el proyecto: {str(e)}")
        raise APIException("Error interno al crear el proyecto", status_code=500)


@api.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    """Obtener todos los proyectos del usuario actual"""
    current_user_id = get_jwt_identity()
    projects = Project.query.filter_by(user_id=current_user_id).all()
    return jsonify([project.serialize() for project in projects]), 200

@api.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Actualizar un proyecto"""
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    if not project or int(project.user_id) != int(current_user_id):
        raise APIException("Proyecto no encontrado o no autorizado", status_code=404)

    data = request.json
    project.name = data.get("name", project.name)
    project.description = data.get("description", project.description)
    project.client = data.get("client", project.client)
    project.start_date = data.get("start_date", project.start_date)
    project.end_date = data.get("end_date", project.end_date)

    db.session.commit()
    return jsonify(project.serialize()), 200

@api.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Eliminar un proyecto"""
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)
    if not project or int(project.user_id) != int(current_user_id):
        raise APIException("Proyecto no encontrado o no autorizado", status_code=404)

    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": f"Proyecto con ID {project_id} eliminado correctamente"}), 200

# --------------------------------------------
# Rutas para Presupuestos (Budgets)
# --------------------------------------------
@api.route('/budgets', methods=['POST'])
@jwt_required()
def create_budget():
    """Crear un nuevo presupuesto"""
    current_user_id = get_jwt_identity()
    data = request.json
    if not data.get("project_id") or not data.get("amount") or not data.get("status"):
        raise APIException("Faltan campos obligatorios (project_id, amount, status)", status_code=400)

    project = Project.query.get(data['project_id'])
    if not project or int(project.user_id) != int(current_user_id):
        raise APIException("Proyecto no encontrado o no autorizado", status_code=404)

    new_budget = Budget(
        user_id=current_user_id,
        project_id=data['project_id'],
        description=data['description'],
        amount=data['amount'],
        status=data['status'],
        date=data.get('date')
    )
    db.session.add(new_budget)
    db.session.commit()
    return jsonify(new_budget.serialize()), 201

@api.route('/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    """Obtener todos los presupuestos del usuario actual"""
    current_user_id = get_jwt_identity()
    budgets = Budget.query.filter_by(user_id=current_user_id).all()
    return jsonify([budget.serialize() for budget in budgets]), 200

@api.route('/budgets/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    """Actualizar un presupuesto"""
    current_user_id = get_jwt_identity()
    budget = Budget.query.get(budget_id)
    if not budget or int(budget.user_id) != int(current_user_id):
        raise APIException("Presupuesto no encontrado o no autorizado", status_code=404)

    data = request.json
    budget.amount = data.get("amount", budget.amount)
    budget.status = data.get("status", budget.status)

    db.session.commit()
    return jsonify(budget.serialize()), 200

@api.route('/budgets/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    """Eliminar un presupuesto"""
    current_user_id = get_jwt_identity()
    budget = Budget.query.get(budget_id)
    if not budget or int(budget.user_id) != int(current_user_id):
        raise APIException("Presupuesto no encontrado o no autorizado", status_code=404)

    db.session.delete(budget)
    db.session.commit()
    return jsonify({"message": f"Presupuesto con ID {budget_id} eliminado correctamente"}), 200

# --------------------------------------------
# Rutas para Empleados (Employees)
# --------------------------------------------
@api.route('/employees', methods=['POST'])
@jwt_required()
def create_employee():
    """Crear un nuevo empleado"""
    current_user_id = get_jwt_identity()
    data = request.json
    if not data.get("name") or not data.get("salary"):
        raise APIException("Faltan campos obligatorios (name, salary)", status_code=400)

    new_employee = Employee(
        user_id=current_user_id,
        name=data['name'],
        salary=data['salary'],
        position=data.get("position", None)  # Opcional
    )
    db.session.add(new_employee)
    db.session.commit()
    return jsonify(new_employee.serialize()), 201

@api.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    """Obtener todos los empleados del usuario actual"""
    current_user_id = get_jwt_identity()
    employees = Employee.query.filter_by(user_id=current_user_id).all()
    return jsonify([employee.serialize() for employee in employees]), 200

@api.route('/employees/<int:employee_id>', methods=['PUT'])
@jwt_required()
def update_employee(employee_id):
    """Actualizar un empleado"""
    current_user_id = get_jwt_identity()
    employee = Employee.query.get(employee_id)
    if not employee or int(employee.user_id) != int(current_user_id):
        raise APIException("Empleado no encontrado o no autorizado", status_code=404)

    data = request.json
    employee.name = data.get("name", employee.name)
    employee.salary = data.get("salary", employee.salary)
    employee.position = data.get("position", employee.position)

    db.session.commit()
    return jsonify(employee.serialize()), 200

@api.route('/employees/<int:employee_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(employee_id):
    """Eliminar un empleado"""
    current_user_id = get_jwt_identity()
    employee = Employee.query.get(employee_id)
    if not employee or int(employee.user_id) != int(current_user_id):
        raise APIException("Empleado no encontrado o no autorizado", status_code=404)

    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message": f"Empleado con ID {employee_id} eliminado correctamente"}), 200

