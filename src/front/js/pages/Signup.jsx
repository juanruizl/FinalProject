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
    <div className="container mt-5">
      <h1>Registrarse</h1>
      <form onSubmit={handleSubmit}>
        {/* Campos del formulario */}
        <button type="submit" className="btn btn-primary">Registrarse</button>
      </form>
    </div>
  );
};

export default Signup;
