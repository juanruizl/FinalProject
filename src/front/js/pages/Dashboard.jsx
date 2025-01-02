import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import Chart from "../components/Chart.jsx";

const Dashboard = () => {
    const { store, actions } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await actions.getCurrentUser();
                await actions.loadTransactions();
                await actions.loadProjects();
                await actions.loadEmployees();
            } catch (error) {
                console.error("Error al cargar datos iniciales:", error);
                setError("Hubo un error al cargar los datos. Por favor, inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <h2>Cargando datos...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5 text-center">
                <h2 className="text-danger">{error}</h2>
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => {
                        setLoading(true);
                        setError(null);
                        actions.getCurrentUser();
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    const user = store.currentUser || {};

    return (
        <div className="container mt-5">
            {/* Título principal */}
            <div className="row mb-4 text-center">
                <div className="col">
                    <h1 className="fw-bold text-primary">{user.company || "Mi Empresa"}</h1>
                    <p className="text-muted fs-5">
                        Bienvenido, <span className="text-dark fw-bold">{user.name || "Usuario"}</span>.
                    </p>
                </div>
            </div>

            {/* Resumen general */}
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 text-center">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-primary">Proyectos</h5>
                            <p className="card-text text-muted">Proyectos activos</p>
                            <h2 className="fw-bold text-primary">{store.projects?.length || 0}</h2>
                            <a href="/projects" className="btn btn-outline-primary mt-3 w-100">Ver Proyectos</a>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 text-center">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-success">Transacciones</h5>
                            <p className="card-text text-muted">Registros financieros</p>
                            <h2 className="fw-bold text-success">{store.transactions?.length || 0}</h2>
                            <a href="/transactions" className="btn btn-outline-success mt-3 w-100">Ver Transacciones</a>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow border-0 h-100 text-center">
                        <div className="card-body">
                            <h5 className="card-title fw-bold text-warning">Empleados</h5>
                            <p className="card-text text-muted">Personal registrado</p>
                            <h2 className="fw-bold text-warning">{store.employees?.length || 0}</h2>
                            <a href="/employees" className="btn btn-outline-warning mt-3 w-100">Ver Empleados</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de datos */}
            <div className="row mt-5">
                <div className="col">
                    <div className="card shadow border-0">
                        <div className="card-header bg-primary text-white text-center">
                            <h5 className="fw-bold mb-0">Resumen Financiero</h5>
                        </div>
                        <div className="card-body">
                            <Chart />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

