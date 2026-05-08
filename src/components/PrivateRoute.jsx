import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
    // Verifica se existe um token salvo no navegador
    const token = localStorage.getItem('token');
    
    // Se tem token, deixa entrar (children). Se não tem, manda pro /login.
    return token ? children : <Navigate to="/login" replace />;
}