import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <header
                className="hero-section position-relative text-white text-center py-5"
                style={{
                    backgroundImage: "url('https://www.palplastic.es/wp-content/uploads/2017/06/gallery-danpatherm2-1024x669.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "80vh",
                }}
            >
                <div className="overlay position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-75"></div>
                <div className="container position-relative z-1 d-flex flex-column align-items-center justify-content-center h-100">
                    <h1 className="display-3 fw-bold">Gestión Empresarial para Autónomos</h1>
                    <p className="lead mt-3 fs-4">
                        Gestiona tu negocio de manera profesional y eficiente con nuestra solución integral.
                    </p>
                    <div className="mt-4">
                        <Link to="/login" className="btn btn-success btn-lg mx-2">Iniciar Sesión</Link>
                        <Link to="/signup" className="btn btn-outline-light btn-lg mx-2">Registrarse</Link>
                    </div>
                </div>
            </header>

            {/* About Section */}
            <section className="container py-5">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <h2 className="fw-bold mb-4">¿Qué ofrecemos?</h2>
                        <p className="fs-5 text-muted">
                            Nuestra plataforma es la herramienta ideal para autónomos y pequeñas empresas. Diseñada
                            para ayudarte a administrar cada aspecto de tu negocio con facilidad y profesionalismo.
                        </p>
                        <ul className="list-unstyled mt-3">
                            <li className="d-flex align-items-center mb-3">
                                <i className="bi bi-check-circle-fill text-success me-3 fs-4"></i>
                                <span>Gestión de cobros y pagos.</span>
                            </li>
                            <li className="d-flex align-items-center mb-3">
                                <i className="bi bi-check-circle-fill text-success me-3 fs-4"></i>
                                <span>Administración eficiente de empleados.</span>
                            </li>
                            <li className="d-flex align-items-center mb-3">
                                <i className="bi bi-check-circle-fill text-success me-3 fs-4"></i>
                                <span>Control de proyectos y presupuestos.</span>
                            </li>
                            <li className="d-flex align-items-center mb-3">
                                <i className="bi bi-check-circle-fill text-success me-3 fs-4"></i>
                                <span>Reportes financieros detallados.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-6 text-center">
                        <img
                            src="https://lideresmexicanos.com/wp-content/uploads/2020/03/Innovacion.jpg"
                            alt="Gestión Empresarial"
                            className="img-fluid rounded shadow"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-light py-5">
                <div className="container text-center">
                    <h2 className="fw-bold mb-5">Características Destacadas</h2>
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="p-4 shadow rounded bg-white">
                                <i className="bi bi-wallet2 display-4 text-primary"></i>
                                <h4 className="mt-3 fw-bold">Gestión Financiera</h4>
                                <p className="text-muted">
                                    Organiza tus ingresos y gastos de forma efectiva, con reportes detallados.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="p-4 shadow rounded bg-white">
                                <i className="bi bi-people-fill display-4 text-success"></i>
                                <h4 className="mt-3 fw-bold">Gestión de Empleados</h4>
                                <p className="text-muted">
                                    Mantén control de tus empleados con datos claros y herramientas útiles.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="p-4 shadow rounded bg-white">
                                <i className="bi bi-bar-chart-fill display-4 text-warning"></i>
                                <h4 className="mt-3 fw-bold">Reportes Detallados</h4>
                                <p className="text-muted">
                                    Accede a reportes financieros precisos para decisiones estratégicas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section
                className="cta-section bg-success text-white text-center py-5"
                style={{
                    backgroundImage: "url('https://img.freepik.com/fotos-premium/concepto-fondo-halloween-pared-oscura-fondo-aterrador-banner-textura-terror_526818-623.jpg?semt=ais_hybrid')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="container">
                    <h2 className="display-4 fw-bold">¿Listo para transformar tu negocio?</h2>
                    <p className="lead mt-3">Regístrate hoy mismo y comienza a disfrutar de todas las ventajas.</p>
                    <Link to="/signup" className="btn btn-light btn-lg mt-4">Comenzar Ahora</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
