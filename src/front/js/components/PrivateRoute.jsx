import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ token }) => {
    const isAuthenticated = !!token || sessionStorage.getItem("token");

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
