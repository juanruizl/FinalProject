import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Budgets = () => {
  const { store, actions } = useContext(Context);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    description: "",
    amount: "",
    status: "pending",
  });

  useEffect(() => {
    actions.loadBudgets();
    actions.loadProjects();
  }, []);

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = formData.id
      ? await actions.updateEntity("budgets", formData.id, "budgets", formData)
      : await actions.createEntity("budgets", "budgets", formData);
    if (success) {
      setShowModal(false);
      setFormData({ project_id: "", description: "", amount: "", status: "pending" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este presupuesto?")) {
      await actions.deleteEntity("budgets", id, "budgets");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Presupuestos</h1>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Proyecto</th>
            <th>Monto</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {store.budgets.map((budget, index) => (
            <tr key={budget.id}>
              <td>{index + 1}</td>
              <td>
                {store.projects.find((project) => project.id === budget.project_id)?.name ||
                  "Desconocido"}
              </td>
              <td>${budget.amount.toLocaleString()}</td>
              <td>{budget.description || "-"}</td>
              <td>{budget.status}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setFormData(budget);
                    handleModalShow();
                  }}
                  className="me-2"
                >
                  Editar
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(budget.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="dark" onClick={handleModalShow}>
        Añadir Presupuesto
      </Button>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Presupuesto" : "Nuevo Presupuesto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Proyecto</Form.Label>
              <Form.Select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar Proyecto</option>
                {store.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </Form.Select>
            </Form.Group>
            <Button variant="dark" type="submit">
              {formData.id ? "Actualizar" : "Crear"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Budgets;
