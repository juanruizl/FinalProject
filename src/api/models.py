from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import calendar

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=False)
    industry = db.Column(db.String(120), nullable=True)  # Sector al que pertenece la empresa
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    payments = db.relationship('Payment', backref='user', lazy=True)
    projects = db.relationship('Project', backref='user', lazy=True)
    budgets = db.relationship('Budget', backref='user', lazy=True)
    employees = db.relationship('Employee', backref='user', lazy=True)

    def set_password(self, password):
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "company": self.company,
            "industry": self.industry,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }


class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(250), nullable=True)
    transaction_type = db.Column(db.String(50), nullable=False)  # 'income' o 'expense'
    status = db.Column(db.String(50), nullable=False)  # 'pending', 'completed'
    company = db.Column(db.String(120), nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "description": self.description,
            "transaction_type": self.transaction_type,
            "status": self.status,
            "company": self.company,
            "date": self.date.isoformat(),
        }

    @staticmethod
    def transform_for_chart(transactions):
        """Transforma las transacciones al formato de QuickChart para un gráfico comparativo."""
        # Definir el orden de los meses
        transactions = sorted(transactions, key=lambda t: t.date)

        # Agrupar transacciones por mes
        data = {}
        for t in transactions:
            month = t.date.strftime('%B')  # Nombre del mes en texto (e.g., 'January')
            if month not in data:
                data[month] = {"income": 0, "expense": 0}
            data[month][t.transaction_type] += t.amount

        # Preparar los datos para QuickChart
        labels = list(data.keys())  # Etiquetas (meses)
        income_data = [data[label]["income"] for label in labels]
        expense_data = [data[label]["expense"] for label in labels]
        profit_data = [income - expense for income, expense in zip(income_data, expense_data)]

        # Estructura de QuickChart
        return {
            "chart": {
                "type": "bar",
                "data": {
                    "labels": labels,  # Etiquetas (meses)
                    "datasets": [
                        {
                            "label": "Ventas (Income)",
                            "data": income_data,
                            "backgroundColor": "rgba(255, 99, 132, 0.6)",  # Rojo
                            "borderColor": "rgba(255, 99, 132, 1)",
                            "borderWidth": 1,
                        },
                        {
                            "label": "Costos (Expense)",
                            "data": expense_data,
                            "backgroundColor": "rgba(54, 162, 235, 0.6)",  # Azul
                            "borderColor": "rgba(54, 162, 235, 1)",
                            "borderWidth": 1,
                        },
                        {
                            "label": "Ganancias (Profit)",
                            "data": profit_data,
                            "backgroundColor": "rgba(75, 192, 192, 0.6)",  # Verde
                            "borderColor": "rgba(75, 192, 192, 1)",
                            "borderWidth": 1,
                            "type": "line",  # Línea para ganancias
                        },
                    ],
                },
                "options": {
                    "plugins": {
                        "title": {
                            "display": True,
                            "text": "Comparación de Costos, Ventas y Ganancias (Ordenados por Mes)",
                            "font": {
                                "size": 18,
                            },
                        },
                    },
                    "scales": {
                        "y": {
                            "beginAtZero": True,
                            "title": {
                                "display": True,
                                "text": "Valores en USD ($)",
                            },
                        },
                        "x": {
                            "title": {
                                "display": True,
                                "text": "Meses",
                            },
                        },
                    },
                    "responsive": True,
                    "maintainAspectRatio": False,
                },
            },
        }


class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    recipient = db.Column(db.String(120), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # 'pending', 'paid'
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "recipient": self.recipient,
            "status": self.status,
            "date": self.date.isoformat(),
        }

class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    salary = db.Column(db.Float, nullable=False)
    position = db.Column(db.String(120), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "salary": self.salary,
            "position": self.position,
        }

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(250), nullable=True)
    client = db.Column(db.String(120), nullable=False)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)

    # Relaciones
    budgets = db.relationship('Budget', backref='project', lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "client": self.client,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat() if self.end_date else None,
        }

class Budget(db.Model):
    __tablename__ = 'budgets'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False)  # 'pending', 'approved', 'rejected'
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "project_id": self.project_id,
            "description": self.description,
            "amount": self.amount,
            "status": self.status,
            "date": self.date.isoformat(),
        }