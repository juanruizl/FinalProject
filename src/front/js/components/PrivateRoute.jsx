import React, { useContext } from "react";
import { Context } from "../store/appContext";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
    const { store } = useContext(Context);

    // Si no hay token, redirigir al login
    return store.token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;

