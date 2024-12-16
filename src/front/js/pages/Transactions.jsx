import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Transactions = () => {
  const { store, actions } = useContext(Context);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    transaction_type: "income",
    status: "pending",
  });

  useEffect(() => {
    actions.loadTransactions();
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
      ? await actions.updateEntity("transactions", formData.id, "transactions", formData)
      : await actions.createEntity("transactions", "transactions", formData);
    if (success) {
      setShowModal(false);
      setFormData({ amount: "", description: "", transaction_type: "income", status: "pending" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
      await actions.deleteEntity("transactions", id, "transactions");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Transacciones</h1>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Monto</th>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {store.transactions.map((transaction, index) => (
            <tr key={transaction.id}>
              <td>{index + 1}</td>
              <td>${transaction.amount.toLocaleString()}</td>
              <td>{transaction.description || "-"}</td>
              <td>{transaction.transaction_type === "income" ? "Ingreso" : "Gasto"}</td>
              <td>{transaction.status}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    setFormData(transaction);
                    handleModalShow();
                  }}
                  className="me-2"
                >
                  Editar
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(transaction.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="dark" onClick={handleModalShow}>
        Añadir Transacción
      </Button>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Transacción" : "Nueva Transacción"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
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
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleChange}
              >
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pendiente</option>
                <option value="completed">Completado</option>
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

export default Transactions;
