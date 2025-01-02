import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const UserProfile = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: store.user?.name || "",
    company: store.user?.company || "",
    industry: store.user?.industry || "",
    password: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const success = await actions.updateUser(formData);
    if (success) {
      alert("Perfil actualizado con éxito.");
    } else {
      alert("Hubo un error al actualizar el perfil.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.");
    if (confirmDelete) {
      const success = await actions.deleteAccount();
      if (success) {
        alert("Cuenta eliminada con éxito.");
        navigate("/");
      } else {
        alert("Hubo un error al eliminar la cuenta.");
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-primary mb-4">Perfil de Usuario</h2>
      <div className="card shadow p-4">
        <form>
          <div className="form-group mb-3">
            <label className="form-label fw-bold">Nombre</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label fw-bold">Compañía</label>
            <input
              type="text"
              name="company"
              className="form-control"
              value={formData.company}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label fw-bold">Industria</label>
            <input
              type="text"
              name="industry"
              className="form-control"
              value={formData.industry}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label fw-bold">Nueva Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
        </form>
        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-primary" onClick={handleUpdate}>
            <i className="bi bi-save me-2"></i> Guardar Cambios
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            <i className="bi bi-trash me-2"></i> Eliminar Cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
