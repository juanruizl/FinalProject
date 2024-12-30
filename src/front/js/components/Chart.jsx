import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const Chart = () => {
    const { actions } = useContext(Context);
    const [chartUrl, setChartUrl] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchChart = async () => {
        setLoading(true);
        try {
            const url = await actions.loadChart(startDate, endDate);
            setChartUrl(url);
            setError(null);
        } catch (err) {
            setError("No se pudo cargar el gráfico");
            setChartUrl(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChart();
    }, []); // Carga inicial del gráfico

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchChart();
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="mt-3">Cargando gráfico...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h3 className="text-center text-primary">Gráfico de Comparación de Transacciones</h3>
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
                chartUrl && (
                    <div className="text-center">
                        <img
                            src={chartUrl}
                            alt="Gráfico de Transacciones"
                            className="img-fluid rounded shadow"
                            style={{ maxWidth: "100%", height: "auto" }}
                        />
                    </div>
                )
            )}
        </div>
    );
};

export default Chart;
