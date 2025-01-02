const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            token: null,
            user_id: null,
            currentUser: null,
            transactions: [],
            projects: [],
            budgets: [],
            employees: [],
            chartUrl: null, 
            errorMessage: null,
            loading: false,
        },
        actions: {
            syncTokenFromSessionStorage: async () => {
                const token = sessionStorage.getItem("token");
                const user_id = sessionStorage.getItem("user_id");
            
                if (token && token.split(".").length === 3) {
                    setStore({ token, user_id });
            
                    // Asegúrate de que getCurrentUser no se llama repetidamente
                    if (!getStore().currentUser) {
                        try {
                            await getActions().getCurrentUser();
                        } catch (error) {
                            console.error("Error al sincronizar usuario:", error.message);
                            sessionStorage.removeItem("token");
                            sessionStorage.removeItem("user_id");
                            setStore({ token: null, user_id: null, currentUser: null });
                        }
                    }
                } else {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("user_id");
                    setStore({ token: null, user_id: null });
                }
            },
            

            login: async (email, password) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setStore({
                            token: data.token,
                            user_id: data.user_id,
                        });
                        sessionStorage.setItem("token", data.token);
                        sessionStorage.setItem("user_id", data.user_id);
                        return true; 
                    } else {
                        const errorData = await response.json();
                        console.error("Error en login:", errorData.msg || response.statusText);
                        return false;
                    }
                } catch (error) {
                    console.error("Error en login:", error.message);
                    return false;
                }
            },

            register: async (formData) => {
                try {
                    const resp = await fetch(`${process.env.BACKEND_URL}/api/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData),
                    });

                    if (!resp.ok) {
                        const errorData = await resp.json();
                        throw new Error(errorData.message || "Error al registrar el usuario");
                    }

                    return true;
                } catch (error) {
                    console.error("Error al registrar usuario:", error);
                    return false;
                }
            },

            logout: () => {
                setStore({ token: null, user_id: null, currentUser: null });
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user_id");
            },

            getCurrentUser: async () => {
                const store = getStore();
                const user_id = store.user_id || sessionStorage.getItem("user_id");
            
                if (!store.token || !user_id) {
                    console.warn("No hay token o user_id disponible para obtener el usuario.");
                    return;
                }
            
                try {
                    // Verifica si el usuario ya está cargado para evitar solicitudes redundantes
                    if (!store.currentUser) {
                        const response = await fetch(`${process.env.BACKEND_URL}/api/users/${user_id}`, {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${store.token}`,
                                "Content-Type": "application/json",
                            },
                        });
            
                        if (response.ok) {
                            const user = await response.json();
                            setStore({ currentUser: user });
                        } else {
                            console.error("Error al obtener el usuario:", response.statusText);
                        }
                    }
                } catch (error) {
                    console.error("Error en getCurrentUser:", error.message);
                }
            },
            

            fetchWithToken: async (url, options = {}) => {
                const store = getStore();
                if (!store.token) {
                    console.error("Token no disponible. Asegúrate de estar autenticado.");
                    throw new Error("Token no disponible. Inicia sesión nuevamente.");
                }
            
                try {
                    const response = await fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${store.token}`,
                            "Content-Type": "application/json",
                        },
                    });
            
                    if (!response.ok) {
                        if (response.status === 401) {
                            console.error("Token inválido o expirado. Cerrando sesión.");
                            getActions().logout();
                        }
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Error ${response.status}`);
                    }
            
                    return await response.json();
                } catch (error) {
                    console.error("Error en fetchWithToken:", error.message);
                    throw error;
                }
            },            

            fetchEntities: async (endpoint, storeKey) => {
                setStore({ loading: true });
                try {
                    const data = await getActions().fetchWithToken(
                        `${process.env.BACKEND_URL}/api/${endpoint}`
                    );
                    setStore({ [storeKey]: data || [] });
                } catch (error) {
                    console.error(`Error al obtener ${storeKey}:`, error.message);
                    setStore({ [storeKey]: [] });
                } finally {
                    setStore({ loading: false });
                }
            },

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

            loadTransactions: async () => {
                const { fetchWithToken } = getActions();
                const store = getStore();
                if (!store.token) {
                    console.error("No se puede cargar transacciones: token no disponible.");
                    throw new Error("No se puede cargar transacciones sin un token.");
                }
            
                try {
                    const transactions = await fetchWithToken(`${process.env.BACKEND_URL}/api/transactions`);
                    setStore({ transactions });
                    return transactions;
                } catch (error) {
                    console.error("Error al cargar transacciones:", error.message);
                    setStore({ transactions: [] });
                    throw error;
                }
            },
                             
            loadPayments: async () =>
                await getActions().fetchEntities("payments", "payments"),
            loadProjects: async () =>
                await getActions().fetchEntities("projects", "projects"),
            loadBudgets: async () =>
                await getActions().fetchEntities("budgets", "budgets"),
            loadEmployees: async () =>
                await getActions().fetchEntities("employees", "employees"),

            loadChart: async (startDate, endDate) => {
                try {
                    let url = `${process.env.BACKEND_URL}/api/chart`;
                    if (startDate || endDate) {
                        const params = new URLSearchParams();
                        if (startDate) params.append("start_date", startDate);
                        if (endDate) params.append("end_date", endDate);
                        url += `?${params.toString()}`;
                    }
            
                    const chartData = await getActions().fetchWithToken(url);
                    if (chartData && chartData.url) {
                        return chartData.url;
                    } else {
                        throw new Error("No se pudo obtener la URL del gráfico.");
                    }
                } catch (error) {
                    console.error("Error al cargar datos del gráfico:", error.message);
                    throw error; 
                }
            },            
        },
    };
};

export default getState;
