import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, CircularProgress, Chip,
    Select, MenuItem, InputLabel, FormControl, FormHelperText
} from '@mui/material';
import { Add, Inventory, WarningAmber } from '@mui/icons-material';
import api from '../services/api';
import Dashboard from './Dashboard';
import { useAuth } from '../hooks/useAuth'; // ← 1. NOVO: Importamos o hook

// Estado inicial espelha exatamente o DTO do backend
const FORM_INICIAL = {
    nomeInsumo: '',
    idCategoria: '',
    capacidade: '',
    tamanho: '',
    material: '',
    estoqueAtual: 0,
    estoqueMinimo: 0,
    dataValidade: '',
};

export default function Insumos() {
    const { cargo } = useAuth(); // ← 2. NOVO: Pegamos o cargo do usuário logado
    const [insumos, setInsumos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(FORM_INICIAL);

    // ← 3. NOVO: Definimos quem pode ver o botão
    const podeCadastrar = cargo === 'ADMINISTRADOR' || cargo === 'GERENTE';

    // Carrega insumos E categorias juntos ao montar o componente
    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [resInsumos, resCategorias] = await Promise.all([
                api.get('/insumos'),
                api.get('/categorias'),
            ]);
            setInsumos(resInsumos.data);
            setCategorias(resCategorias.data);
        } catch (err) {
            setError('Erro ao carregar dados. Verifique a conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => { setOpen(true); setError(''); };
    const handleClose = () => { setOpen(false); setError(''); setFormData(FORM_INICIAL); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/insumos', formData);
            carregarDados();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao cadastrar insumo.');
        }
    };

    return (
        <Dashboard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" color="primary">
                        Estoque de Insumos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Monitore e gerencie todos os insumos hospitalares
                    </Typography>
                </Box>
                
                {/* ← 4. NOVO: O botão só renderiza se podeCadastrar for verdadeiro */}
                {podeCadastrar && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpen}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Novo Insumo
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }} elevation={2}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Unidade / Tamanho</strong></TableCell>
                            <TableCell><strong>Material</strong></TableCell>
                            <TableCell align="center"><strong>Estoque Atual</strong></TableCell>
                            <TableCell align="center"><strong>Mínimo</strong></TableCell>
                            <TableCell><strong>Validade</strong></TableCell>
                            <TableCell align="center"><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : insumos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    Nenhum insumo cadastrado ainda.
                                </TableCell>
                            </TableRow>
                        ) : (
                            insumos.map((insumo) => (
                                <TableRow key={insumo.id} hover>
                                    <TableCell>{insumo.nomeInsumo}</TableCell>
                                    <TableCell>{insumo.capacidade || insumo.tamanho || '—'}</TableCell>
                                    <TableCell>{insumo.material || '—'}</TableCell>
                                    <TableCell align="center">{insumo.estoqueAtual}</TableCell>
                                    <TableCell align="center">{insumo.estoqueMinimo}</TableCell>
                                    <TableCell>
                                        {insumo.dataValidade
                                            ? new Date(insumo.dataValidade).toLocaleDateString('pt-BR', {timeZone: 'UTC'})
                                            : '—'}
                                    </TableCell>
                                    <TableCell align="center">
                                        {insumo.estoqueAtual <= insumo.estoqueMinimo ? (
                                            <Chip icon={<WarningAmber />} label="CRÍTICO" color="error" variant="outlined" size="small" />
                                        ) : (
                                            <Chip icon={<Inventory />} label="OK" color="success" variant="outlined" size="small" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Cadastro (Não precisa esconder o modal, pois o botão que o abre já está escondido) */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">Cadastrar Novo Insumo</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <TextField
                            fullWidth name="nomeInsumo" label="Nome do Insumo"
                            margin="dense" required
                            value={formData.nomeInsumo} onChange={handleChange}
                        />

                        <FormControl fullWidth margin="dense" required>
                            <InputLabel>Categoria</InputLabel>
                            <Select
                                name="idCategoria"
                                value={formData.idCategoria}
                                label="Categoria"
                                onChange={handleChange}
                            >
                                {categorias.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.nomeCategoria}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                {categorias.length === 0
                                    ? 'Nenhuma categoria encontrada. Cadastre uma primeiro.'
                                    : 'Selecione a categoria deste insumo.'}
                            </FormHelperText>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <TextField
                                name="capacidade" label="Capacidade" fullWidth
                                value={formData.capacidade} onChange={handleChange}
                                placeholder="Ex: 500ml, 1L"
                            />
                            <TextField
                                name="tamanho" label="Tamanho" fullWidth
                                value={formData.tamanho} onChange={handleChange}
                                placeholder="Ex: P, M, G, 10cm"
                            />
                        </Box>

                        <TextField
                            fullWidth name="material" label="Material"
                            margin="dense"
                            value={formData.material} onChange={handleChange}
                            placeholder="Ex: Látex, Algodão, Plástico"
                        />

                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <TextField
                                type="number" name="estoqueAtual" label="Estoque Inicial"
                                fullWidth required inputProps={{ min: 0 }}
                                value={formData.estoqueAtual} onChange={handleChange}
                            />
                            <TextField
                                type="number" name="estoqueMinimo" label="Estoque Mínimo"
                                fullWidth required inputProps={{ min: 0 }}
                                value={formData.estoqueMinimo} onChange={handleChange}
                            />
                        </Box>

                        <TextField
                            fullWidth name="dataValidade" label="Data de Validade"
                            margin="dense" type="date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.dataValidade} onChange={handleChange}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleClose} color="inherit">Cancelar</Button>
                        <Button type="submit" variant="contained">Salvar Insumo</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Dashboard>
    );
}