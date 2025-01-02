import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";
import Employees from "./pages/Employees.jsx";
import Projects from "./pages/Projects.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/Profile.jsx";

const App = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <div className="container">
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Rutas protegidas */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/budgets" element={<Budgets />} />
                        <Route path="/employees" element={<Employees />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/profile" element={<UserProfile />} /> 
                    </Route>

                    {/* Ruta por defecto */}
                    <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
                </Routes>
            </div>
            <Footer />
        </BrowserRouter>
    );
};

export default App;
