import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Divider, Chip } from '@mui/material';
import { 
    Inventory, CompareArrows, AdminPanelSettings, VisibilityOutlined, 
    WarningAmber, TrendingUp, TrendingDown 
} from '@mui/icons-material';
import { useAuth, temPermissao } from '../hooks/useAuth';
import DashboardLayout from './Dashboard';
import api from '../services/api'; 

const CARDS_NAVEGACAO = [
    { recurso: 'insumos',       icon: <Inventory sx={{ fontSize: 32 }} color="primary" />,    titulo: 'Insumos',       descricao: 'Gerencie o catálogo hospitalar.' },
    { recurso: 'movimentacoes', icon: <CompareArrows sx={{ fontSize: 32 }} color="secondary" />, titulo: 'Movimentações', descricao: 'Entradas e saídas de estoque.' },
    { recurso: 'categorias',    icon: <AdminPanelSettings sx={{ fontSize: 32 }} color="primary" />, titulo: 'Categorias', descricao: 'Organize os grupos de itens.' },
    { recurso: 'usuarios',      icon: <VisibilityOutlined sx={{ fontSize: 32 }} color="error" />,  titulo: 'Usuários',    descricao: 'Controle de acessos.' },
];

export default function DashboardHome() {
    const { cargo, email } = useAuth();
    const cardsVisiveis = CARDS_NAVEGACAO.filter(c => temPermissao(cargo, c.recurso));

    // 1. Estado atualizado para receber entradas e saídas
    const [kpis, setKpis] = useState({
        totalInsumos: 0,
        entradas: 0,
        saidas: 0,
        criticos: 0
    });

    // 2. Busca todos os dados de uma vez
    useEffect(() => {
        async function carregarIndicadores() {
            try {
                const [resInsumos, resMovimentacoes] = await Promise.all([
                    api.get('/insumos'),
                    api.get('/movimentacoes').catch(() => ({ data: [] })) 
                ]);

                const listaInsumos = resInsumos.data;
                const listaMovimentacoes = resMovimentacoes.data;

                console.log("As movimentações que chegaram do Java:", listaMovimentacoes);

                // Cálculos lógicos
                // Conta o item como crítico se o estoque atual for MENOR OU IGUAL ao estoque mínimo
                const quantidadeCriticos = listaInsumos.filter(i => {
                    return Number(i.estoqueAtual) <= Number(i.estoqueMinimo);
                }).length;
                
                // LÓGICA CORRIGIDA: Procuramos por 'tipo' ou 'tipoMovimentacao'
                const totalEntradas = listaMovimentacoes.filter(m => {
                    const tipo = String(m.tipo || m.tipoMovimentacao || '').toUpperCase();
                    return tipo === 'ENTRADA';
                }).length;

                const totalSaidas = listaMovimentacoes.filter(m => {
                    const tipo = String(m.tipo || m.tipoMovimentacao || '').toUpperCase();
                    return tipo === 'SAIDA' || tipo === 'SAÍDA';
                }).length;

                // Atualiza a tela
                setKpis({
                    totalInsumos: listaInsumos.length,
                    entradas: totalEntradas,
                    saidas: totalSaidas,
                    criticos: quantidadeCriticos
                });

            } catch (error) {
                console.error("Erro ao carregar KPIs do servidor:", error);
            }
        }

        // Removida a trava: agora todos os perfis (incluindo AUDITOR) carregam os números
        carregarIndicadores();
    }, []);

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" color="primary">
                    Painel Geral VitalMed
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Logado como <strong>{email}</strong> · Perfil: <Chip size="small" label={cargo} color="primary" variant="outlined" sx={{ ml: 1, fontWeight: 'bold' }}/>
                </Typography>
            </Box>

            {/* SEÇÃO 1: INDICADORES REAIS (4 KPIs) - Removida a trava do cargo aqui também */}
            <Grid container spacing={2} sx={{ mb: 5 }}>
                
                {/* KPI 1: Total de Insumos (Azul) */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#bfdbfe' }}>
                            <Inventory color="primary" sx={{ fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="900" color="primary.dark">{kpis.totalInsumos}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="bold">Insumos Cadastrados</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* KPI 2: Entradas (Verde) */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#bbf7d0' }}>
                            <TrendingUp color="success" sx={{ fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="900" color="success.dark">{kpis.entradas}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="bold">Reg. de Entradas</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* KPI 3: Saídas (Laranja) */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#fed7aa' }}>
                            <TrendingDown sx={{ fontSize: 28, color: '#ea580c' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="900" sx={{ color: '#9a3412' }}>{kpis.saidas}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="bold">Reg. de Saídas</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* KPI 4: Estoque Crítico (Vermelho) */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 2.5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: '#fecaca' }}>
                            <WarningAmber color="error" sx={{ fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="900" color="error.dark">{kpis.criticos}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight="bold">Itens Críticos</Typography>
                        </Box>
                    </Paper>
                </Grid>

            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* SEÇÃO 2: MENU RÁPIDO */}
            <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ mb: 2 }}>
                Acesso Rápido
            </Typography>

            {cardsVisiveis.length === 0 ? (
                <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', backgroundColor: '#f8fafc' }} elevation={1}>
                    <VisibilityOutlined sx={{ fontSize: 56, color: '#94a3b8', mb: 2 }} />
                    <Typography variant="h6" fontWeight="700" color="text.secondary">Modo de Auditoria Ativo</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 500, mx: 'auto' }}>
                        Seu perfil possui acesso apenas a relatórios de leitura. 
                        Aguarde a liberação do módulo de emissão de relatórios PDF.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {cardsVisiveis.map((card) => (
                        <Grid item xs={12} sm={6} md={3} key={card.recurso}>
                            <Paper
                                elevation={1}
                                onClick={() => window.location.href = `/${card.recurso}`}
                                sx={{
                                    p: 2.5, borderRadius: 3,
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    border: '1px solid transparent',
                                    '&:hover': { 
                                        boxShadow: 4, 
                                        transform: 'translateY(-4px)',
                                        borderColor: 'primary.light'
                                    }
                                }}
                            >
                                <Box sx={{ mb: 2 }}>{card.icon}</Box>
                                <Typography fontWeight="800" sx={{ mb: 0.5 }}>{card.titulo}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {card.descricao}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </DashboardLayout>
    );
}
