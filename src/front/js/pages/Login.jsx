import React, { useContext, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { actions } = useContext(Context);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await actions.login(email, password);
        if (success) {
            navigate("/dashboard"); // Redirigir al Dashboard
        } else {
            alert("Error en el inicio de sesión");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="col-md-6 p-5 bg-light shadow rounded">
                <h2 className="text-center mb-4">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Ingresa tu correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-dark w-100">Entrar</button>
                </form>
                <p className="text-center mt-3">
                    ¿No tienes una cuenta?{" "}
                    <a href="/signup" className="text-decoration-none">Regístrate aquí</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
