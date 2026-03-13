import { createContext, useState, useEffect, useContext } from 'react';
import { login as loginService, register as registerService } from '../api/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Restore real user email saved during login
            const storedEmail = localStorage.getItem('userEmail');
            setUser({ email: storedEmail || '' });
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const data = await loginService(email, password);
            // Backend returns plain string token based on controller analysis
            const jwtCallback = (tokenStr) => {
                setToken(tokenStr);
                localStorage.setItem('token', tokenStr);
                localStorage.setItem('userEmail', email);
                setUser({ email });
            };

            if (typeof data === 'string') {
                jwtCallback(data);
                return true;
            } else {
                console.error("Unexpected login response", data);
                return false;
            }
        } catch (error) {
            console.error('Login failed', error);
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            await registerService(name, email, password);
            return true;
        } catch (error) {
            console.error('Registration failed', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
