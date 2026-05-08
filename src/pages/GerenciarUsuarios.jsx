import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, CircularProgress, Chip,
    IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem,
    Avatar
} from '@mui/material';
import { Edit, Delete, ManageAccounts, Refresh } from '@mui/icons-material';
import api from '../services/api';
import Dashboard from './Dashboard';

const CARGOS = ['ADMINISTRADOR', 'GERENTE', 'ALMOXARIFE', 'AUDITOR'];

// Cor do chip por cargo
const COR_CARGO = {
    ADMINISTRADOR: 'error',
    FARMACEUTICO:  'primary',
    ENFERMEIRO:    'success',
    TECNICO:       'warning',
    ESTOQUISTA:    'default',
};

// Iniciais para o Avatar
const iniciais = (nome) =>
    nome?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';

const FORM_EDICAO_INICIAL = { nome: '', email: '', cargo: '' };

export default function GerenciarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal de edição
    const [editOpen, setEditOpen] = useState(false);
    const [editando, setEditando] = useState(null); // usuário sendo editado
    const [editForm, setEditForm] = useState(FORM_EDICAO_INICIAL);
    const [editError, setEditError] = useState('');

    // Modal de confirmação de exclusão
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletando, setDeletando] = useState(null);

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const carregarUsuarios = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/usuarios');
            setUsuarios(response.data);
        } catch (err) {
            setError('Erro ao carregar usuários.');
        } finally {
            setLoading(false);
        }
    };

    // --- Edição ---
    const handleAbrirEdicao = (usuario) => {
        setEditando(usuario);
        setEditForm({ nome: usuario.nome, email: usuario.email, cargo: usuario.cargo });
        setEditError('');
        setEditOpen(true);
    };

    const handleFecharEdicao = () => {
        setEditOpen(false);
        setEditando(null);
        setEditForm(FORM_EDICAO_INICIAL);
        setEditError('');
    };

    const handleSalvarEdicao = async (e) => {
        e.preventDefault();
        setEditError('');
        try {
            await api.put(`/usuarios/${editando.id}`, editForm);
            setSuccess(`Usuário "${editForm.nome}" atualizado com sucesso.`);
            carregarUsuarios();
            handleFecharEdicao();
        } catch (err) {
            setEditError(
                err.response?.data?.message ||
                err.response?.data ||
                'Erro ao atualizar usuário.'
            );
        }
    };

    // --- Exclusão ---
    const handleAbrirDelete = (usuario) => {
        setDeletando(usuario);
        setDeleteOpen(true);
    };

    const handleConfirmarDelete = async () => {
        try {
            await api.delete(`/usuarios/${deletando.id}`);
            setSuccess(`Usuário "${deletando.nome}" removido com sucesso.`);
            carregarUsuarios();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Erro ao remover usuário.'
            );
        } finally {
            setDeleteOpen(false);
            setDeletando(null);
        }
    };

    return (
        <Dashboard>
            {/* Cabeçalho */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ManageAccounts color="primary" sx={{ fontSize: 36 }} />
                    <Box>
                        <Typography variant="h4" fontWeight="800" color="primary">
                            Gerenciar Usuários
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {usuarios.length} usuário(s) cadastrado(s) no sistema
                        </Typography>
                    </Box>
                </Box>
                <Tooltip title="Recarregar lista">
                    <IconButton onClick={carregarUsuarios} color="primary">
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>
            )}

            {/* Tabela */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }} elevation={4}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell><strong>Usuário</strong></TableCell>
                            <TableCell><strong>E-mail</strong></TableCell>
                            <TableCell align="center"><strong>Cargo</strong></TableCell>
                            <TableCell align="center"><strong>ID</strong></TableCell>
                            <TableCell align="center"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : usuarios.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    Nenhum usuário cadastrado ainda.
                                </TableCell>
                            </TableRow>
                        ) : (
                            usuarios.map((u) => (
                                <TableRow key={u.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                                                {iniciais(u.nome)}
                                            </Avatar>
                                            <Typography fontWeight="500">{u.nome}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{u.email}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={u.cargo}
                                            color={COR_CARGO[u.cargo] || 'default'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                        #{u.id}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Editar usuário">
                                            <IconButton
                                                color="primary" size="small"
                                                onClick={() => handleAbrirEdicao(u)}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Remover usuário">
                                            <IconButton
                                                color="error" size="small"
                                                onClick={() => handleAbrirDelete(u)}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Edição */}
            <Dialog open={editOpen} onClose={handleFecharEdicao} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">
                    Editar Usuário
                    <Typography variant="body2" color="text.secondary">
                        ID #{editando?.id}
                    </Typography>
                </DialogTitle>
                <form onSubmit={handleSalvarEdicao}>
                    <DialogContent dividers>
                        {editError && (
                            <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>
                        )}
                        <TextField
                            fullWidth name="nome" label="Nome Completo"
                            margin="dense" required
                            value={editForm.nome}
                            onChange={(e) => setEditForm(p => ({ ...p, nome: e.target.value }))}
                        />
                        <TextField
                            fullWidth name="email" label="E-mail"
                            type="email" margin="dense" required
                            value={editForm.email}
                            onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))}
                        />
                        <FormControl fullWidth margin="dense" required>
                            <InputLabel>Cargo</InputLabel>
                            <Select
                                value={editForm.cargo} label="Cargo"
                                onChange={(e) => setEditForm(p => ({ ...p, cargo: e.target.value }))}
                            >
                                {CARGOS.map((c) => (
                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleFecharEdicao} color="inherit">Cancelar</Button>
                        <Button type="submit" variant="contained">Salvar Alterações</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Modal de Confirmação de Exclusão */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="error">Remover Usuário</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 1 }}>
                        Esta ação é permanente e não pode ser desfeita.
                    </Alert>
                    <Typography>
                        Tem certeza que deseja remover <strong>{deletando?.nome}</strong> do sistema?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteOpen(false)} color="inherit">Cancelar</Button>
                    <Button onClick={handleConfirmarDelete} variant="contained" color="error">
                        Sim, remover
                    </Button>
                </DialogActions>
            </Dialog>
        </Dashboard>
    );
}