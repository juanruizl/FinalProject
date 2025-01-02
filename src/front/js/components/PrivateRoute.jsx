import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Context } from "../store/appContext";

const PrivateRoute = () => {
    const { store } = useContext(Context);

    // Verifica si el token está en el store o en sessionStorage
    const isAuthenticated = !!store.token || sessionStorage.getItem("token");

    if (!isAuthenticated) {
        console.warn("Intento de acceso sin autenticación. Redirigiendo a /login.");
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
