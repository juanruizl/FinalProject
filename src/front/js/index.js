import React from "react";
import ReactDOM from "react-dom/client"; 
import App from "./App.jsx";
import injectContext from "./store/appContext.js"; // Asegúrate de que el contexto está correctamente configurado

// Envuelve App con el contexto
const AppWithContext = injectContext(App);

// Selecciona el contenedor raíz
const rootElement = document.getElementById("app");
if (!rootElement) {
    throw new Error("No se encontró el elemento con id 'app'");
}

// Crea la raíz y renderiza el componente principal con el contexto
const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <AppWithContext />
    </React.StrictMode>
);
