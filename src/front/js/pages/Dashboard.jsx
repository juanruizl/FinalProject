import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";

const Dashboard = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.loadTransactions();
        actions.loadProjects();
        actions.loadEmployees();
    }, []);

    return (
        <div className="container mt-5">
            <div className="row mb-4">
                <div className="col text-center">
                    <h1 className="fw-bold">Panel de Control</h1>
                    <p className="text-muted">
                        Bienvenido, <span className="text-dark">{store.user?.name}</span>. Aquí tienes un resumen de tu empresa: <span className="text-dark">{store.user?.company}</span>.
                    </p>
                </div>
            </div>
            <div className="row g-4">
                {/* Resumen de Proyectos */}
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title fw-bold">Proyectos</h5>
                            <p className="card-text text-muted">Total de proyectos activos</p>
                            <h2 className="fw-bold text-primary">{store.projects?.length || 0}</h2>
                            <a href="/projects" className="btn btn-dark mt-3 w-100">Ver Proyectos</a>
                        </div>
                    </div>
                </div>

                {/* Resumen de Transacciones */}
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title fw-bold">Transacciones</h5>
                            <p className="card-text text-muted">Registros financieros</p>
                            <h2 className="fw-bold text-success">{store.transactions?.length || 0}</h2>
                            <a href="/transactions" className="btn btn-dark mt-3 w-100">Ver Transacciones</a>
                        </div>
                    </div>
                </div>

                {/* Resumen de Empleados */}
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="card-title fw-bold">Empleados</h5>
                            <p className="card-text text-muted">Personal registrado</p>
                            <h2 className="fw-bold text-warning">{store.employees?.length || 0}</h2>
                            <a href="/employees" className="btn btn-dark mt-3 w-100">Ver Empleados</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfica o detalles adicionales */}
            <div className="row mt-5">
                <div className="col">
                    <div className="card shadow border-0">
                        <div className="card-body">
                            <h5 className="card-title fw-bold">Últimas Transacciones</h5>
                            {store.transactions?.length ? (
                                <ul className="list-group list-group-flush">
                                    {store.transactions.slice(0, 5).map((transaction, index) => (
                                        <li
                                            key={index}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            {transaction.description || "Sin descripción"}
                                            <span className="badge bg-primary rounded-pill">
                                                ${transaction.amount.toFixed(2)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">No hay transacciones recientes.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
