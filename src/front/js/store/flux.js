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
            chartUrl: null, // Para gráficos
            errorMessage: null,
            loading: false,
        },
        actions: {
            // Sincronizar el token y el user_id desde sessionStorage
            syncTokenFromSessionStorage: async () => {
                const token = sessionStorage.getItem("token");
                const user_id = sessionStorage.getItem("user_id");
                if (token && token.split(".").length === 3) {
                    setStore({ token, user_id });
                    try {
                        await getActions().getCurrentUser();
                    } catch {
                        sessionStorage.removeItem("token");
                        sessionStorage.removeItem("user_id");
                        setStore({ token: null, user_id: null, currentUser: null });
                    }
                } else {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("user_id");
                    setStore({ token: null, user_id: null });
                }
            },

            // Inicio de sesión
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
                        return true; // Login exitoso
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

            // Registro de usuario
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

            // Cerrar sesión
            logout: () => {
                setStore({ token: null, user_id: null, currentUser: null });
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user_id");
            },

            // Obtener datos del usuario actual
            getCurrentUser: async () => {
                const store = getStore();
                const user_id = store.user_id || sessionStorage.getItem("user_id");
                if (!store.token || !user_id) return;

                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/api/users/${user_id}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${store.token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (response.ok) {
                        const user = await response.json();
                        console.log("Usuario obtenido:", user);
                        setStore({ currentUser: user }); // Guardar como objeto
                    } else {
                        console.error("Error al obtener el usuario:", response.statusText);
                    }
                } catch (error) {
                    console.error("Error en getCurrentUser:", error.message);
                }
            },

            // Solicitud protegida con token
            fetchWithToken: async (url, options = {}) => {
                const store = getStore();
                if (!store.token) {
                    console.error("Token no disponible");
                    return null;
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

            // Manejo de entidades (CRUD)
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

            // Cargar datos específicos
            loadTransactions: async () =>
                await getActions().fetchEntities("transactions", "transactions"),
            loadPayments: async () =>
                await getActions().fetchEntities("payments", "payments"),
            loadProjects: async () =>
                await getActions().fetchEntities("projects", "projects"),
            loadBudgets: async () =>
                await getActions().fetchEntities("budgets", "budgets"),
            loadEmployees: async () =>
                await getActions().fetchEntities("employees", "employees"),

            // Cargar datos del gráfico
            loadChart: async (startDate, endDate) => {
                try {
                    // Construye la URL con los parámetros de fechas si están presentes
                    let url = `${process.env.BACKEND_URL}/api/chart`;
                    if (startDate || endDate) {
                        const params = new URLSearchParams();
                        if (startDate) params.append("start_date", startDate);
                        if (endDate) params.append("end_date", endDate);
                        url += `?${params.toString()}`;
                    }
            
                    // Realiza la solicitud al backend
                    const chartData = await getActions().fetchWithToken(url);
                    if (chartData && chartData.url) {
                        return chartData.url;
                    } else {
                        throw new Error("No se pudo obtener la URL del gráfico.");
                    }
                } catch (error) {
                    console.error("Error al cargar datos del gráfico:", error.message);
                    throw error; // Deja que el componente Chart maneje este error
                }
            },            
        },
    };
};

export default getState;
