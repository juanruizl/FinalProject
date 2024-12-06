import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import Card from "../components/Card.jsx"

const Dashboard = () => {
  const { store, actions } = useContext(Context);

  useEffect(() => {
    actions.loadTransactions();
    actions.loadProjects();
    actions.loadEmployees();
  }, []);

  return (
    <div className="container mt-5">
      <h1>Bienvenido, {store.user?.name}</h1>
      <div className="row">
        {/* Tarjetas de datos */}
      </div>
    </div>
  );
};

export default Dashboard;
