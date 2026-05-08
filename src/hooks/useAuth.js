import { jwtDecode } from 'jwt-decode';

export function useAuth() {
    const token = localStorage.getItem('token');
    if (!token) return { autenticado: false, cargo: null, idUsuario: null, email: null };

    try {
        const decoded = jwtDecode(token);

        // Verifica se o token expirou
        const expirou = decoded.exp && decoded.exp * 1000 < Date.now();
        if (expirou) {
            localStorage.removeItem('token');
            return { autenticado: false, cargo: null, idUsuario: null, email: null };
        }

        return {
            autenticado: true,
            email:       decoded.sub,           
            cargo:       decoded.cargo,          
            idUsuario:   decoded.idUsuario ?? null,
        };
    } catch {
        return { autenticado: false, cargo: null, idUsuario: null, email: null };
    }
}

// Permissões por cargo — fonte única da verdade
export const PERMISSOES = {
    ADMINISTRADOR: ['insumos', 'movimentacoes', 'categorias', 'usuarios'],
    GERENTE:       ['insumos', 'movimentacoes', 'categorias'],
    ALMOXARIFE:    ['movimentacoes', 'insumos'],
    AUDITOR:       [],   // somente leitura — vê o dashboard mas não opera nada
};

export function temPermissao(cargo, recurso) {
    return PERMISSOES[cargo]?.includes(recurso) ?? false;
}