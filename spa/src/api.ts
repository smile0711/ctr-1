import axios from "axios";

import appStore from "./appStore";

// axios config
axios.defaults.withCredentials = true; // Include cookies in all requests

// Add request interceptor to include token in header for backward compatibility
axios.interceptors.request.use(function(config) {
    if (appStore.data.user.token) {
        config.headers.apiToken = appStore.data.user.token;
    }
    return config;
});

// Add response interceptor to handle token refresh
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error is due to an expired token and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                await appStore.methods.refreshToken();

                // Retry the original request with the new token
                if (appStore.data.user.token) {
                    originalRequest.headers.apiToken = appStore.data.user.token;
                }
                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                appStore.methods.destroySession();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const api = {
    get: <T>(endpoint: string, data?: any) => {
        return axios.get<T>("/api" + endpoint, {
            params: data,
            withCredentials: true
        });
    },
    post: <T>(endpoint: string, data?: any, formData?: boolean) => {
        const config = { withCredentials: true };

        if (formData) {
            var postData = new FormData();
            Object.keys(data).forEach((key) => postData.append(key, data[key]));
            return axios.post<T>("/api" + endpoint, postData, config);
        } else {
            return axios.post<T>("/api" + endpoint, data, config);
        }
    },
};
export default api;
