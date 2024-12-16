const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            token: null,
            currentUser: null,
            transactions: [],
            payments: [],
            projects: [],
            budgets: [],
            employees: [],
            errorMessage: null,
            loading: false,
        },
        actions: {
            // Sincronizar token desde sessionStorage
            syncTokenFromSessionStorage: () => {
                const token = sessionStorage.getItem("token");
                if (token) {
                    setStore({ token });
                }
            },

            // Iniciar sesión
            login: async (email, password) => {
                setStore({ loading: true, errorMessage: null });
                try {
                    const resp = await fetch(`${process.env.BACKEND_URL}/api/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });

                    if (!resp.ok) {
                        const errorData = await resp.json();
                        throw new Error(errorData.msg || "Error en el inicio de sesión");
                    }

                    const data = await resp.json();
                    setStore({ token: data.token });
                    sessionStorage.setItem("token", data.token);

                    // Obtener datos del usuario actual
                    await getActions().getCurrentUser();
                    return true;
                } catch (error) {
                    setStore({ errorMessage: error.message });
                    return false;
                } finally {
                    setStore({ loading: false });
                }
            },

            // Cerrar sesión
            logout: () => {
                setStore({ token: null, currentUser: null });
                sessionStorage.removeItem("token");
            },

            // Obtener datos del usuario actual
            getCurrentUser: async () => {
                const store = getStore();
                if (!store.token) return;

                setStore({ loading: true });
                try {
                    const user = await getActions().fetchWithToken(
                        `${process.env.BACKEND_URL}/api/protected`
                    );
                    setStore({ currentUser: user });
                } catch (error) {
                    console.error("Error al obtener el usuario actual:", error);
                } finally {
                    setStore({ loading: false });
                }
            },

            // Función genérica para obtener entidades
            fetchEntities: async (endpoint, storeKey) => {
                setStore({ loading: true });
                try {
                    const data = await getActions().fetchWithToken(
                        `${process.env.BACKEND_URL}/api/${endpoint}`
                    );
                    setStore({ [storeKey]: data });
                } catch (error) {
                    console.error(`Error al obtener ${storeKey}:`, error);
                } finally {
                    setStore({ loading: false });
                }
            },

            // Crear entidad genérica
            createEntity: async (endpoint, storeKey, data) => {
                const store = getStore();
                try {
                    const entity = await getActions().fetchWithToken(
                        `${process.env.BACKEND_URL}/api/${endpoint}`,
                        {
                            method: "POST",
                            body: JSON.stringify(data),
                        }
                    );
                    setStore({ [storeKey]: [...store[storeKey], entity] });
                    return true;
                } catch (error) {
                    console.error(`Error al crear en ${endpoint}:`, error);
                    return false;
                }
            },

            // Actualizar entidad genérica
            updateEntity: async (endpoint, id, storeKey, data) => {
                const store = getStore();
                try {
                    const entity = await getActions().fetchWithToken(
                        `${process.env.BACKEND_URL}/api/${endpoint}/${id}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(data),
                        }
                    );
                    const updatedStore = store[storeKey].map((item) =>
                        item.id === id ? entity : item
                    );
                    setStore({ [storeKey]: updatedStore });
                    return true;
                } catch (error) {
                    console.error(`Error al actualizar en ${endpoint}:`, error);
                    return false;
                }
            },

            // Eliminar entidad genérica
            deleteEntity: async (endpoint, id, storeKey) => {
                const store = getStore();
                try {
                    await getActions().fetchWithToken(
                        `${process.env.BACKEND_URL}/api/${endpoint}/${id}`,
                        { method: "DELETE" }
                    );
                    const updatedStore = store[storeKey].filter((item) => item.id !== id);
                    setStore({ [storeKey]: updatedStore });
                } catch (error) {
                    console.error(`Error al eliminar en ${endpoint}:`, error);
                }
            },

            // Funciones específicas para cada entidad
            loadTransactions: async () => await getActions().fetchEntities("transactions", "transactions"),
            loadPayments: async () => await getActions().fetchEntities("payments", "payments"),
            loadProjects: async () => await getActions().fetchEntities("projects", "projects"),
            loadBudgets: async () => await getActions().fetchEntities("budgets", "budgets"),
            loadEmployees: async () => await getActions().fetchEntities("employees", "employees"),

            // Solicitud protegida genérica
            fetchWithToken: async (url, options = {}) => {
                const store = getStore();
                try {
                    const resp = await fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${store.token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (!resp.ok) {
                        const errorData = await resp.json();
                        throw new Error(errorData.msg || `Error ${resp.status}`);
                    }

                    return await resp.json();
                } catch (error) {
                    console.error("Error en la solicitud protegida:", error);
                    throw error;
                }
            },
        },
    };
};

export default getState;
