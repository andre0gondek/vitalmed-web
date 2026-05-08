import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, CircularProgress, Chip
} from '@mui/material';
import { Add, Label } from '@mui/icons-material';
import api from '../services/api';
import Dashboard from './Dashboard';

export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [nomeCategoria, setNomeCategoria] = useState('');

    useEffect(() => {
        carregarCategorias();
    }, []);

    const carregarCategorias = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categorias');
            setCategorias(response.data);
        } catch (err) {
            setError('Erro ao carregar categorias. Verifique a conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setOpen(true);
        setError('');
        setSuccess('');
    };

    const handleClose = () => {
        setOpen(false);
        setNomeCategoria('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Envia exatamente o DTO esperado pelo backend
            await api.post('/categorias', { nomeCategoria });
            setSuccess(`Categoria "${nomeCategoria}" cadastrada com sucesso!`);
            carregarCategorias();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao cadastrar categoria.');
        }
    };

    return (
        <Dashboard>
            {/* Cabeçalho da página */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" color="primary">
                        Categorias
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Gerencie as categorias de insumos hospitalares
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpen}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Nova Categoria
                </Button>
            </Box>

            {/* Alertas de feedback */}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Tabela */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }} elevation={2}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell width={100}><strong>ID</strong></TableCell>
                            <TableCell><strong>Nome da Categoria</strong></TableCell>
                            <TableCell align="center"><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : categorias.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    Nenhuma categoria cadastrada ainda.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categorias.map((cat) => (
                                <TableRow key={cat.id} hover>
                                    <TableCell sx={{ fontWeight: '500', color: 'text.secondary' }}>
                                        #{cat.id}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Label fontSize="small" color="primary" />
                                            {cat.nomeCategoria}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label="Ativa" color="success" variant="outlined" size="small" />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de cadastro */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">Nova Categoria de Insumo</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        <TextField
                            fullWidth
                            label="Nome da Categoria"
                            placeholder="Ex: Medicamentos, EPI, Material Cirúrgico..."
                            margin="dense"
                            required
                            autoFocus
                            value={nomeCategoria}
                            onChange={(e) => setNomeCategoria(e.target.value)}
                            helperText="O nome será exibido na seleção de insumos."
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleClose} color="inherit">Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={!nomeCategoria.trim()}>
                            Salvar Categoria
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Dashboard>
    );
}