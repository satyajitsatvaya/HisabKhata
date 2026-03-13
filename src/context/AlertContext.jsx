import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { XCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);
    const timerRef = useRef(null);

    const showAlert = (message, type = 'info', duration = 3000) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setAlert({ message, type });
        if (duration) {
            timerRef.current = setTimeout(() => {
                setAlert(null);
            }, duration);
        }
    };

    const hideAlert = () => setAlert(null);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alert && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${alert.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' :
                            alert.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                    'bg-blue-50 border-blue-100 text-blue-700'
                        }`}>
                        {alert.type === 'error' && <XCircle size={20} />}
                        {alert.type === 'success' && <CheckCircle size={20} />}
                        {alert.type === 'warning' && <AlertTriangle size={20} />}
                        {alert.type === 'info' && <Info size={20} />}

                        <p className="text-sm font-medium pr-2">{alert.message}</p>

                        <button onClick={hideAlert} className="opacity-50 hover:opacity-100 transition-opacity">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
};
