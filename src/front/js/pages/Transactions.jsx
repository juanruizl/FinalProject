import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { Modal, Button, Form, Table, Badge, Spinner } from "react-bootstrap";

const Transactions = () => {
    const { store, actions } = useContext(Context);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        transaction_type: "income",
        status: "pending",
        date: "",
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

        if (formData.amount <= 0) {
            alert("El monto debe ser mayor a 0.");
            return;
        }

        if (new Date(formData.date) > new Date()) {
            alert("La fecha no puede ser futura.");
            return;
        }

        const isUpdate = !!formData.id;
        const success = isUpdate
            ? await actions.updateEntity("transactions", formData.id, "transactions", formData)
            : await actions.createEntity("transactions", "transactions", formData);

        if (success) {
            setShowModal(false);
            setFormData({
                amount: "",
                description: "",
                transaction_type: "income",
                status: "pending",
                date: "",
            });
        } else {
            alert("Hubo un error al procesar la transacción.");
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
            {store.loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Descripción</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(store.transactions) && store.transactions.length > 0 ? (
                            store.transactions.map((transaction, index) => (
                                <tr key={transaction.id}>
                                    <td>{index + 1}</td>
                                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                    <td
                                        className={
                                            transaction.transaction_type === "income"
                                                ? "text-success fw-bold"
                                                : "text-danger fw-bold"
                                        }
                                    >
                                        {transaction.transaction_type === "income" ? "+" : "-"}${
                                            transaction.amount.toLocaleString()
                                        }
                                    </td>
                                    <td>{transaction.description || "-"}</td>
                                    <td>
                                        <Badge
                                            bg={
                                                transaction.transaction_type === "income"
                                                    ? "success"
                                                    : "danger"
                                            }
                                        >
                                            {transaction.transaction_type === "income"
                                                ? "Ingreso"
                                                : "Gasto"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge
                                            bg={
                                                transaction.status === "completed"
                                                    ? "primary"
                                                    : "secondary"
                                            }
                                        >
                                            {transaction.status === "completed"
                                                ? "Completado"
                                                : "Pendiente"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => {
                                                setFormData({
                                                    ...transaction,
                                                    date: new Date(transaction.date)
                                                        .toISOString()
                                                        .split("T")[0],
                                                });
                                                handleModalShow();
                                            }}
                                            className="me-2"
                                        >
                                            <i className="bi bi-pencil"></i> Editar
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(transaction.id)}
                                        >
                                            <i className="bi bi-trash"></i> Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    No hay transacciones disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

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
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
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
