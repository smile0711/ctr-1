import Vue from "vue";

/** Represents the shape of user data object on the global app store */
export interface User {
    id?: number;
    avatar?: {
        id: string;
        name: string;
        filename: string;
        gestures: string[];
    };
    roleName?: string;
    username?: string;
    token?: string; // Kept for backward compatibility
    admin?: boolean;
    hasHome?: boolean;
    chatdefault?: number;
    firstname?: string;
    isAuthenticated?: boolean;
}

export interface Place {
    assets_dir?: string;
    block?: any;
    hood?: any;
    colony?: any;
    created_at?: string;
    description?: string;
    id?: number | string;
    map_background_index?: string;
    map_icon_index?: string;
    member_id?: number;
    name?: string;
    slug?: string;
    status?: number;
    type?: string;
    updated_at?: string;
    world_filename?: string;
}

/** Represents the shape of the global app store object */
export interface AppStore {
    data: {
        loading: boolean;
        isUser: boolean;
        x3dReady: boolean;
        user: User;
        view3d: boolean;
        place: Place;
    };
    methods: {
        destroySession: () => void;
        setToken: (token: string) => void;
        setView3d: (value: boolean) => void;
        setPlace: (value: Place) => void;
        setUser: (userData: object) => void;
    };
}

const appStore = Vue.observable<AppStore>({
    data: {
        loading: false,
        isUser: false,
        x3dReady: false,
        view3d: false,
        user: {
            token: localStorage.getItem("token"), // Kept for backward compatibility
            isAuthenticated: false
        },
        place: {},
    },
    methods: {
        destroySession() {
            // Clear token from localStorage (for backward compatibility)
            localStorage.removeItem("token");

            // Clear cookies by making a request to logout endpoint
            fetch('/api/member/logout', {
                method: 'POST',
                credentials: 'include'
            }).catch(err => console.error('Error during logout:', err));

            // Update store state
            appStore.data.user = { isAuthenticated: false };
            appStore.data.isUser = false;
        },
        setToken(token: string): void {
            // Store token in the store for backward compatibility
            appStore.data.user.token = token;

            // Mark user as authenticated
            appStore.data.user.isAuthenticated = true;
            appStore.data.isUser = true;

            // Keep token in localStorage for backward compatibility
            localStorage.setItem("token", token);
        },
        setView3d(value: boolean): void {
            appStore.data.view3d = value;
        },
        setPlace(placeData: Place): void {
            appStore.data.place = placeData;
        },
        setUser(userData: User): void {
            if (
                typeof userData.avatar !== "undefined" &&
                typeof userData.avatar.gestures === "string" &&
                userData.avatar.gestures !== ""
            ) {
                userData.avatar.gestures = JSON.parse(userData.avatar.gestures);
            }

            // If we have a token, mark as authenticated
            if (userData.token) {
                userData.isAuthenticated = true;
                appStore.data.isUser = true;
            }

            appStore.data.user = { ...appStore.data.user, ...userData };

            if (appStore.data.user.chatdefault === 1) {
                appStore.data.view3d = true;
            }
        },
        refreshToken(): Promise<void> {
            return fetch('/api/member/refresh-token', {
                method: 'POST',
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Token refresh failed');
                }
                return response.json();
            })
            .then(data => {
                // Update token in store for backward compatibility
                if (data.token) {
                    appStore.data.user.token = data.token;
                    localStorage.setItem("token", data.token);
                }
                return data;
            });
        }
    },
});
export default appStore;
