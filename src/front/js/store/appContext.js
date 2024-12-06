import React, { useState, useEffect } from "react";
import getState from "./flux.js";

// Inicializamos el contexto
export const Context = React.createContext(null);

// Función para envolver el componente pasado con el contexto
const injectContext = (PassedComponent) => {
    const StoreWrapper = (props) => {
        // Estado inicial del contexto
        const [state, setState] = useState(
            getState({
                getStore: () => state.store,
                getActions: () => state.actions,
                setStore: (updatedStore) =>
                    setState({
                        store: Object.assign(state.store, updatedStore),
                        actions: { ...state.actions },
                    }),
            })
        );

        useEffect(() => {
            console.log("Initializing context...");
            if (state?.actions?.syncTokenFromSessionStorage) {
                state.actions.syncTokenFromSessionStorage();
            } else {
                console.warn("syncTokenFromSessionStorage no está definido");
            }

            // Otros efectos secundarios iniciales pueden ir aquí
        }, []);

        // Proveer el contexto al componente
        return (
            <Context.Provider value={state}>
                <PassedComponent {...props} />
            </Context.Provider>
        );
    };

    return StoreWrapper;
};

export default injectContext;