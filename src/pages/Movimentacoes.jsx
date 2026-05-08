import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, CircularProgress, Chip,
    Select, MenuItem, InputLabel, FormControl, FormHelperText,
    ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { Add, TrendingUp, TrendingDown } from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import Dashboard from './Dashboard';

// Espelha exatamente o MovimentacaoCreateDTO do backend
const FORM_INICIAL = {
    idInsumo: '',
    idUsuario: '',        
    tipoMovimentacao: 'ENTRADA',
    quantidade: 1,
    finalidade: '',
};

// Formata LocalDateTime do Java para exibição legível
const formatarData = (dataHora) => {
    if (!dataHora) return '—';
    return new Date(dataHora).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

export default function Movimentacoes() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [formData, setFormData] = useState(FORM_INICIAL);

    useEffect(() => {
        // Extrai o idUsuario do token JWT salvo no localStorage
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                // O claim "sub" guarda o email; o backend precisa do ID.
                // Se o seu JwtService adicionar o ID como claim, use decoded.id
                // Por ora, usamos o claim "idUsuario" se existir, ou deixamos vazio
                // para o usuário preencher (veja nota abaixo)
                setFormData(prev => ({ ...prev, idUsuario: decoded.idUsuario || '' }));
            }
        } catch {
            // Token inválido: idUsuario ficará vazio
        }
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [resMovs, resInsumos] = await Promise.all([
                api.get('/movimentacoes'),
                api.get('/insumos'),
            ]);
            setMovimentacoes(resMovs.data);
            setInsumos(resInsumos.data);
        } catch (err) {
            setError('Erro ao carregar dados. Verifique a conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setOpen(true);
        setSubmitError('');
    };

    const handleClose = () => {
        setOpen(false);
        setSubmitError('');
        // Preserva o idUsuario ao resetar
        setFormData(prev => ({ ...FORM_INICIAL, idUsuario: prev.idUsuario }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTipo = (_, novoTipo) => {
        // ToggleButtonGroup retorna null se clicar no já selecionado — evita desmarcar
        if (novoTipo !== null) {
            setFormData(prev => ({ ...prev, tipoMovimentacao: novoTipo }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        try {
            // Garante que quantidade e IDs chegam como números (não strings)
            const payload = {
                ...formData,
                idInsumo: Number(formData.idInsumo),
                idUsuario: Number(formData.idUsuario),
                quantidade: Number(formData.quantidade),
            };
            await api.post('/movimentacoes', payload);
            carregarDados();
            handleClose();
        } catch (err) {
            // Exibe a mensagem de regra de negócio do backend (ex: estoque insuficiente)
            setSubmitError(
                err.response?.data?.message ||
                err.response?.data ||
                'Erro ao registrar movimentação.'
            );
        }
    };

    return (
        <Dashboard>
            {/* Cabeçalho */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" color="primary">
                        Movimentações de Estoque
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Histórico completo de entradas e saídas
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpen}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Nova Movimentação
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Tabela de histórico */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }} elevation={4}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell><strong>Data / Hora</strong></TableCell>
                            <TableCell><strong>Insumo</strong></TableCell>
                            <TableCell align="center"><strong>Tipo</strong></TableCell>
                            <TableCell align="center"><strong>Quantidade</strong></TableCell>
                            <TableCell><strong>Responsável</strong></TableCell>
                            <TableCell><strong>Finalidade</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : movimentacoes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    Nenhuma movimentação registrada ainda.
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Mais recente primeiro
                            [...movimentacoes].reverse().map((mov) => (
                                <TableRow key={mov.id} hover>
                                    <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontSize: '0.85rem' }}>
                                        {formatarData(mov.dataHora)}
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="500">{mov.nomeInsumo}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {mov.tipoMovimentacao === 'ENTRADA' ? (
                                            <Chip
                                                icon={<TrendingUp fontSize="small" />}
                                                label="ENTRADA"
                                                color="success"
                                                variant="outlined"
                                                size="small"
                                            />
                                        ) : (
                                            <Chip
                                                icon={<TrendingDown fontSize="small" />}
                                                label="SAÍDA"
                                                color="error"
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography fontWeight="600">
                                            {mov.tipoMovimentacao === 'ENTRADA' ? '+' : '-'}{mov.quantidade}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{mov.nomeUsuarioResponsavel}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                        {mov.finalidade}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Nova Movimentação */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">Registrar Movimentação</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        {submitError && (
                            <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
                        )}

                        {/* Tipo de Movimentação — ToggleButton visual e intuitivo */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Tipo de Movimentação *
                            </Typography>
                            <ToggleButtonGroup
                                value={formData.tipoMovimentacao}
                                exclusive
                                onChange={handleTipo}
                                fullWidth
                            >
                                <ToggleButton
                                    value="ENTRADA"
                                    color="success"
                                    sx={{ fontWeight: 'bold', gap: 1 }}
                                >
                                    <TrendingUp /> ENTRADA
                                </ToggleButton>
                                <ToggleButton
                                    value="SAIDA"
                                    color="error"
                                    sx={{ fontWeight: 'bold', gap: 1 }}
                                >
                                    <TrendingDown /> SAÍDA
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* Select de Insumo */}
                        <FormControl fullWidth margin="dense" required>
                            <InputLabel>Insumo</InputLabel>
                            <Select
                                name="idInsumo"
                                value={formData.idInsumo}
                                label="Insumo"
                                onChange={handleChange}
                            >
                                {insumos.map((ins) => (
                                    <MenuItem key={ins.id} value={ins.id}>
                                        {ins.nomeInsumo}
                                        <Typography
                                            component="span"
                                            variant="caption"
                                            sx={{ ml: 1, color: 'text.secondary' }}
                                        >
                                            (estoque: {ins.estoqueAtual})
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                O estoque será atualizado automaticamente após o registro.
                            </FormHelperText>
                        </FormControl>

                        {/* Quantidade */}
                        <TextField
                            fullWidth
                            name="quantidade"
                            label="Quantidade"
                            type="number"
                            margin="dense"
                            required
                            slotProps={{ htmlInput: { min: 1 } }}
                            value={formData.quantidade}
                            onChange={handleChange}
                        />

                        {/* ID do Usuário responsável */}
                        <TextField
                            fullWidth
                            name="idUsuario"
                            label="ID do Usuário Responsável"
                            type="number"
                            margin="dense"
                            required
                            value={formData.idUsuario}
                            onChange={handleChange}
                            helperText="Informe o ID do usuário que está realizando a movimentação."
                        />

                        {/* Finalidade */}
                        <TextField
                            fullWidth
                            name="finalidade"
                            label="Finalidade / Observação"
                            margin="dense"
                            required
                            multiline
                            rows={3}
                            placeholder="Ex: Reposição mensal do estoque, Uso no bloco cirúrgico..."
                            value={formData.finalidade}
                            onChange={handleChange}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleClose} color="inherit">Cancelar</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color={formData.tipoMovimentacao === 'ENTRADA' ? 'success' : 'error'}
                            disabled={!formData.idInsumo || !formData.idUsuario || !formData.finalidade.trim()}
                        >
                            {formData.tipoMovimentacao === 'ENTRADA' ? 'Registrar Entrada' : 'Registrar Saída'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Dashboard>
    );
}