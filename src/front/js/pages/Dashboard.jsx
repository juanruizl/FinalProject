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
            <div className="row mb-4">
                <div className="col text-center">
                    <h1 className="fw-bold">{user.company || "Mi Empresa"}</h1>
                    <p className="text-muted">
                        Bienvenido, <span className="text-dark">{user.name || "Usuario"}</span>.
                        Aquí tienes un resumen de cómo se encuentra actualmente tu empresa.
                    </p>
                </div>
            </div>

            <div className="row g-4">
                {/* Resumen general */}
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

            {/* Gráfico de transacciones */}
            <div className="row mt-5">
                <div className="col">
                    <div className="card shadow border-0">
                        <div className="card-body">
                            <Chart /> {/* Aquí se utiliza el componente Chart */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
