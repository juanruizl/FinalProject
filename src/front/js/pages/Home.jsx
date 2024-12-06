import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="container-fluid bg-light text-dark">
            {/* Hero Section */}
            <header className="bg-dark text-white text-center py-5">
                <div className="container">
                    <h1 className="display-4">Gestión Empresarial para Autónomos</h1>
                    <p className="lead mt-3">
                        La solución integral para gestionar tu negocio de manera eficiente y profesional.
                    </p>
                    <div className="mt-4">
                        <Link to="/login" className="btn btn-primary btn-lg m-2">Iniciar Sesión</Link>
                        <Link to="/signup" className="btn btn-outline-light btn-lg m-2">Registrarse</Link>
                    </div>
                </div>
            </header>

            {/* About Section */}
            <section className="container py-5">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <h2 className="fw-bold">¿Qué ofrecemos?</h2>
                        <p className="mt-3">
                            Nuestra plataforma está diseñada para ayudarte a administrar todos los aspectos de tu negocio,
                            desde la gestión de transacciones hasta el control de empleados y proyectos. Con una interfaz
                            intuitiva y herramientas avanzadas, te ofrecemos la tranquilidad de tener todo bajo control.
                        </p>
                        <ul className="list-unstyled mt-3">
                            <li><i className="bi bi-check-circle-fill text-success me-2"></i> Gestión de cobros y pagos.</li>
                            <li><i className="bi bi-check-circle-fill text-success me-2"></i> Administración de empleados.</li>
                            <li><i className="bi bi-check-circle-fill text-success me-2"></i> Control detallado de proyectos y presupuestos.</li>
                            <li><i className="bi bi-check-circle-fill text-success me-2"></i> Reportes financieros claros y precisos.</li>
                        </ul>
                    </div>
                    <div className="col-md-6">
                        <img
                            src="https://www.palplastic.es/wp-content/uploads/2017/06/gallery-danpatherm2-1024x669.jpg"
                            alt="Gestión Empresarial"
                            className="img-fluid rounded shadow"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-5">
                <div className="container text-center">
                    <h2 className="fw-bold">Características Destacadas</h2>
                    <div className="row mt-4">
                        <div className="col-md-4 mb-3">
                            <i className="bi bi-wallet2 display-4 text-primary"></i>
                            <h4 className="mt-3">Gestión Financiera</h4>
                            <p>
                                Organiza tus ingresos, gastos, y controla tus flujos de caja de forma eficiente.
                            </p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <i className="bi bi-people-fill display-4 text-success"></i>
                            <h4 className="mt-3">Gestión de Empleados</h4>
                            <p>
                                Mantén un registro actualizado de tu equipo, incluyendo salarios y posiciones.
                            </p>
                        </div>
                        <div className="col-md-4 mb-3">
                            <i className="bi bi-bar-chart-fill display-4 text-warning"></i>
                            <h4 className="mt-3">Reportes Detallados</h4>
                            <p>
                                Genera reportes financieros precisos para tomar decisiones estratégicas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
