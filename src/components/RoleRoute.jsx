import { Navigate } from 'react-router-dom';
import { useAuth, temPermissao } from '../hooks/useAuth';

/**
 * Uso: <RoleRoute recurso="usuarios"> <GerenciarUsuarios /> </RoleRoute>
 * Se o cargo não tiver permissão, redireciona para /dashboard.
 */
export default function RoleRoute({ recurso, children }) {
    const { autenticado, cargo } = useAuth();

    if (!autenticado) return <Navigate to="/login" replace />;
    if (!temPermissao(cargo, recurso)) return <Navigate to="/dashboard" replace />;

    return children;
}