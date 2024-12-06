import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";

const Signup = () => {
    const { actions } = useContext(Context);
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        industry: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await actions.register(formData);
        if (success) {
            alert("Usuario registrado correctamente");
            window.location.href = "/login";
        } else {
            alert("Error al registrar el usuario");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="col-md-8 p-5 bg-light shadow rounded">
                <h2 className="text-center mb-4">Crear Cuenta</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ingresa tu nombre completo"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Nombre de la Empresa</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nombre de tu empresa"
                            value={formData.company}
                            onChange={(e) =>
                                setFormData({ ...formData, company: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Industria</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Sector de la empresa"
                            value={formData.industry}
                            onChange={(e) =>
                                setFormData({ ...formData, industry: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Ingresa tu correo"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Crea una contraseña"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-dark w-100">Registrarse</button>
                </form>
                <p className="text-center mt-3">
                    ¿Ya tienes una cuenta?{" "}
                    <a href="/login" className="text-decoration-none">Inicia sesión aquí</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;
