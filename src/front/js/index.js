import React from "react";
import ReactDOM from "react-dom/client"; 
import App from "./App.jsx";
import injectContext from "./store/appContext.js"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Incluye el JavaScript de Bootstrap

// Envuelve App con el contexto
const AppWithContext = injectContext(App);

// Selecciona el contenedor raíz
const rootElement = document.getElementById("app");
if (!rootElement) {
    console.error("No se encontró el elemento con id 'app'. Verifica el archivo HTML.");
    throw new Error("No se encontró el elemento con id 'app'");
}

// Crea la raíz y renderiza el componente principal con el contexto
const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <AppWithContext />
    </React.StrictMode>
);

console.log("Aplicación renderizada correctamente.");
