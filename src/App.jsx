import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Login            from './pages/Login';
import Insumos          from './pages/Insumos';
import Categorias       from './pages/Categorias';
import Movimentacoes    from './pages/Movimentacoes';
import CadastrarUsuario from './pages/CadastrarUsuario';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import PrivateRoute     from './components/PrivateRoute';
import RoleRoute        from './components/RoleRoute';
import DashboardHome    from './pages/DashboardHome';

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route path="/"       element={<Navigate to="/login" replace />} />
        <Route path="/login"  element={<Login />} />

        {/* Acessível para qualquer usuário autenticado - AGORA APONTANDO PARA O HOME */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardHome />
          </PrivateRoute>
        } />

        {/* Recurso: insumos → ADMINISTRADOR e GERENTE */}
        <Route path="/insumos" element={
          <PrivateRoute>
            <RoleRoute recurso="insumos"><Insumos /></RoleRoute>
          </PrivateRoute>
        } />

        {/* Recurso: movimentacoes → ADMINISTRADOR, GERENTE e ALMOXARIFE */}
        <Route path="/movimentacoes" element={
          <PrivateRoute>
            <RoleRoute recurso="movimentacoes"><Movimentacoes /></RoleRoute>
          </PrivateRoute>
        } />

        {/* Recurso: categorias → ADMINISTRADOR e GERENTE */}
        <Route path="/categorias" element={
          <PrivateRoute>
            <RoleRoute recurso="categorias"><Categorias /></RoleRoute>
          </PrivateRoute>
        } />

        {/* Recurso: usuarios → somente ADMINISTRADOR */}
        <Route path="/usuarios/novo" element={
          <PrivateRoute>
            <RoleRoute recurso="usuarios"><CadastrarUsuario /></RoleRoute>
          </PrivateRoute>
        } />
        
        <Route path="/usuarios" element={
          <PrivateRoute>
            <RoleRoute recurso="usuarios"><GerenciarUsuarios /></RoleRoute>
          </PrivateRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;