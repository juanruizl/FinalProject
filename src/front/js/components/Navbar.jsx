import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const Navbar = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  const handleLogout = () => {
      actions.logout();
      navigate("/login");
  };

  return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container">
              <Link className="navbar-brand" to={store.token ? "/dashboard" : "/"}>
                  Gestión Empresarial
              </Link>
              <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarNav"
                  aria-controls="navbarNav"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
              >
                  <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav ms-auto">
                      {store.token ? (
                          <>
                              {/* Rutas protegidas */}
                              <li className="nav-item">
                                  <Link className="nav-link" to="/dashboard">
                                      Dashboard
                                  </Link>
                              </li>
                              <li className="nav-item">
                                  <Link className="nav-link" to="/transactions">
                                      Transacciones
                                  </Link>
                              </li>
                              <li className="nav-item">
                                  <Link className="nav-link" to="/projects">
                                      Proyectos
                                  </Link>
                              </li>
                              <li className="nav-item">
                                  <Link className="nav-link" to="/payments">
                                      Pagos
                                  </Link>
                              </li>
                              <li className="nav-item">
                                  <Link className="nav-link" to="/budgets">
                                      Presupuestos
                                  </Link>
                              </li>
                              <li className="nav-item">
                                  <button
                                      className="btn btn-danger nav-link"
                                      onClick={handleLogout}
                                  >
                                      Cerrar Sesión
                                  </button>
                              </li>
                          </>
                      ) : (
                          <>
                              {/* Rutas públicas */}
                              <li className="nav-item">
                                  <Link className="nav-link" to="/login">
                                      Iniciar Sesión
                                  </Link>
                              </li>
                              <li className="nav-item">
                                  <Link className="nav-link" to="/signup">
                                      Registrarse
                                  </Link>
                              </li>
                          </>
                      )}
                  </ul>
              </div>
          </div>
      </nav>
  );
};

export default Navbar;