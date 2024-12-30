import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";

const Chart = () => {
    const { actions, store } = useContext(Context);
    const [chartUrl, setChartUrl] = useState(null);
    const [tableData, setTableData] = useState([]); // Estado para los datos de la tabla
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchChartAndData = async () => {
        setLoading(true);
        try {
            // Cargar gráfico
            const url = await actions.loadChart(startDate, endDate);
            setChartUrl(url);

            // Cargar transacciones
            const transactions = await actions.loadTransactions(); // Obtén todas las transacciones
            const filteredData = filterAndGroupTransactions(transactions, startDate, endDate);
            setTableData(filteredData);

            setError(null);
        } catch (err) {
            setError("No se pudieron cargar los datos");
            setChartUrl(null);
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartAndData();
    }, []); // Carga inicial del gráfico y datos

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchChartAndData();
    };

    const filterAndGroupTransactions = (transactions, startDate, endDate) => {
        // Filtrar por fechas si están definidas
        const filtered = transactions.filter((t) => {
            const date = new Date(t.date);
            return (
                (!startDate || date >= new Date(startDate)) &&
                (!endDate || date <= new Date(endDate))
            );
        });
    
        // Agrupar por mes
        const grouped = filtered.reduce((acc, transaction) => {
            const month = new Date(transaction.date).toISOString().slice(0, 7); // Formato YYYY-MM
            if (!acc[month]) {
                acc[month] = { income: 0, expense: 0 };
            }
            if (transaction.transaction_type === "income") {
                acc[month].income += transaction.amount;
            } else if (transaction.transaction_type === "expense") {
                acc[month].expense += transaction.amount;
            }
            return acc;
        }, {});
    
        // Transformar en un array para la tabla y ordenar por mes (descendente)
        return Object.keys(grouped)
            .map((month) => ({
                month,
                income: grouped[month].income,
                expense: grouped[month].expense,
                balance: grouped[month].income - grouped[month].expense,
            }))
            .sort((a, b) => new Date(b.month) - new Date(a.month)); // Ordenar por fecha descendente
    };
    

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="mt-3">Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h3 className="text-center text-primary">Gráfico y Datos de Transacciones</h3>
            <Form onSubmit={handleFilterSubmit} className="mb-4">
                <div className="row g-2">
                    <div className="col-md-5">
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Fecha de inicio"
                        />
                    </div>
                    <div className="col-md-5">
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="Fecha de fin"
                        />
                    </div>
                    <div className="col-md-2">
                        <Button type="submit" variant="primary" className="w-100">
                            Filtrar
                        </Button>
                    </div>
                </div>
            </Form>
            {error ? (
                <p className="text-danger text-center">{error}</p>
            ) : (
                <>
                    {chartUrl && (
                        <div className="text-center mb-4">
                            <img
                                src={chartUrl}
                                alt="Gráfico de Transacciones"
                                className="img-fluid rounded shadow"
                                style={{ maxWidth: "100%", height: "auto" }}
                            />
                        </div>
                    )}
                    {tableData.length > 0 ? (
                        <Table striped bordered hover responsive className="mt-4">
                            <thead>
                                <tr>
                                    <th>Mes</th>
                                    <th>Total de Ingresos</th>
                                    <th>Total de Gastos</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.month}</td>
                                        <td>{row.income.toFixed(2)}</td>
                                        <td>{row.expense.toFixed(2)}</td>
                                        <td>{row.balance.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p className="text-center mt-4">No hay datos disponibles para las fechas seleccionadas.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default Chart;
