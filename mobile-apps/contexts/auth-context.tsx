import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUser } from "@/lib/api/auth";

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    education?: string;
    [key: string]: any;
}

interface AuthContextType {
    id: any;
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user?: User) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
    id: null
});

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const savedToken = await AsyncStorage.getItem("token");

                if (savedToken) {
                    setToken(savedToken);

                    try {
                        const me = await getCurrentUser();
                        setUser(me);
                    } catch {
                        // Token invalid → hapus
                        await AsyncStorage.removeItem("token");
                        setToken(null);
                        setUser(null);
                    }
                }
            } finally {
                setInitializing(false);
            }
        };

        loadSession();
    }, []);

    const login = async (jwt: string, usr?: User) => {
        await AsyncStorage.setItem("token", jwt);
        setToken(jwt);

        if (usr) {
            setUser(usr);
        } else {
            const me = await getCurrentUser();
            setUser(me);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    if (initializing) return null;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading: initializing,
                login,
                logout,
                id: user?.id || null
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
