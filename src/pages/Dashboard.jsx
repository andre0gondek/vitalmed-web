import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
         ListItemButton, ListItemIcon, ListItemText, Divider,
         Chip, Tooltip } from '@mui/material';
import { AddBox, CompareArrows, Logout, Category,
         PersonAdd, ManageAccounts, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, temPermissao } from '../hooks/useAuth';

const drawerWidth = 240;

// Cada item declara qual 'recurso' precisa ter permissão
const MENU_ITEMS = [
    {
        label:   'Dashboard',
        icon:    <DashboardIcon color="primary" />,
        path:    '/dashboard',
        recurso: null,  // null = visível para todos autenticados
    },
    {
        label:   'Gestão de Insumos',
        icon:    <AddBox color="primary" />,
        path:    '/insumos',
        recurso: 'insumos',
    },
    {
        label:   'Movimentações',
        icon:    <CompareArrows color="secondary" />,
        path:    '/movimentacoes',
        recurso: 'movimentacoes',
    },
    {
        label:   'Categorias',
        icon:    <Category color="primary" />,
        path:    '/categorias',
        recurso: 'categorias',
    },
    {
        label:   'Cadastrar Usuário',
        icon:    <PersonAdd color="primary" />,
        path:    '/usuarios/novo',
        recurso: 'usuarios',
    },
    {
        label:   'Gerenciar Usuários',
        icon:    <ManageAccounts color="secondary" />,
        path:    '/usuarios',
        recurso: 'usuarios',
    },
];

// Cor do chip de cargo na AppBar
const COR_CARGO = {
    ADMINISTRADOR: '#f87171',
    GERENTE:       '#60a5fa',
    ALMOXARIFE:    '#34d399',
    AUDITOR:       '#fbbf24',
};

export default function Dashboard({ children }) {
    const navigate  = useNavigate();
    const location  = useLocation();
    const { cargo, email } = useAuth();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Filtra apenas os itens que o cargo atual pode ver
    const itensFiltrados = MENU_ITEMS.filter(
        (item) => item.recurso === null || temPermissao(cargo, item.recurso)
    );

    return (
        <Box sx={{
            display: 'flex',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" noWrap fontWeight="bold" sx={{ letterSpacing: 1 }}>
                        VitalMed{' '}
                        <span style={{ fontWeight: 'normal', fontSize: '0.85em', opacity: 0.8 }}>
                            | Gestão Hospitalar
                        </span>
                    </Typography>

                    {/* Info do usuário logado */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {email}
                        </Typography>
                        {cargo && (
                            <Chip
                                label={cargo}
                                size="small"
                                sx={{
                                    backgroundColor: COR_CARGO[cargo] ?? '#94a3b8',
                                    color: '#0f172a',
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem',
                                }}
                            />
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer lateral */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(10px)',
                        borderRight: 'none',
                        boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2, px: 2 }}>
                    {/* Seção com o cargo do usuário */}
                    <Box sx={{
                        mb: 2, p: 2, borderRadius: 2,
                        backgroundColor: 'rgba(37, 99, 235, 0.06)',
                        border: '1px solid rgba(37, 99, 235, 0.12)'
                    }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Nível de acesso
                        </Typography>
                        <Typography variant="body2" fontWeight="700" color="primary">
                            {cargo ?? '—'}
                        </Typography>
                    </Box>

                    <List>
                        {itensFiltrados.map((item) => {
                            const ativo = location.pathname === item.path;
                            return (
                                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 2,
                                            backgroundColor: ativo
                                                ? 'rgba(37, 99, 235, 0.10)'
                                                : 'transparent',
                                            borderLeft: ativo
                                                ? '3px solid #2563eb'
                                                : '3px solid transparent',
                                            '&:hover': {
                                                backgroundColor: 'rgba(37, 99, 235, 0.06)',
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 38 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            slotProps={{
                                                primary: {
                                                    fontWeight: ativo ? '700' : '500',
                                                    fontSize: '0.88rem',
                                                    color: ativo ? '#2563eb' : 'inherit',
                                                }
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>

                    <Divider sx={{ my: 2, opacity: 0.6 }} />

                    <List>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={handleLogout}
                                sx={{ borderRadius: 2, '&:hover': { backgroundColor: '#fee2e2' } }}
                            >
                                <ListItemIcon sx={{ minWidth: 38 }}>
                                    <Logout color="error" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Sair do Sistema"
                                    slotProps={{ primary: { color: '#d32f2f', fontWeight: 'bold', fontSize: '0.88rem' } }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Conteúdo principal */}
            <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <Toolbar />
                <Box sx={{
                    p: 4,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    minHeight: 'calc(100vh - 120px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}