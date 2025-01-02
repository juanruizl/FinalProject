import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Employees = () => {
  const { store, actions } = useContext(Context);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    salary: "",
    position: "",
  });

  useEffect(() => {
    actions.loadEmployees();
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
      ? await actions.updateEntity("employees", formData.id, "employees", formData)
      : await actions.createEntity("employees", "employees", formData);
    if (success) {
      setShowModal(false);
      setFormData({ name: "", salary: "", position: "" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
      await actions.deleteEntity("employees", id, "employees");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-primary mb-4">Empleados</h1>

      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="bg-dark text-white">
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Salario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {store.employees.map((employee, index) => (
            <tr key={employee.id}>
              <td>{index + 1}</td>
              <td>{employee.name}</td>
              <td>{employee.position || "-"}</td>
              <td>${employee.salary.toLocaleString()}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setFormData(employee);
                    handleModalShow();
                  }}
                  className="me-2"
                >
                  <i className="bi bi-pencil"></i> Editar
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(employee.id)}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="primary" onClick={handleModalShow} className="mt-4">
        Añadir Empleado
      </Button>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Empleado" : "Nuevo Empleado"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Puesto</Form.Label>
              <Form.Control
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Salario</Form.Label>
              <Form.Control
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              {formData.id ? "Actualizar" : "Crear"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Employees;
