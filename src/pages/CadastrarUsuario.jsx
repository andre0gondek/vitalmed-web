import { useState } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Alert,
    FormControl, InputLabel, Select, MenuItem, FormHelperText,
    CircularProgress, Divider
} from '@mui/material';
import { PersonAdd, CheckCircle } from '@mui/icons-material';
import api from '../services/api';
import Dashboard from './Dashboard';

const CARGOS = ['ADMINISTRADOR', 'GERENTE', 'ALMOXARIFE', 'AUDITOR'];

const FORM_INICIAL = {
    nome: '',
    email: '',
    senha: '',
    cargo: '',
};

export default function CadastrarUsuario() {
    const [formData, setFormData] = useState(FORM_INICIAL);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const response = await api.post('/usuarios', formData);
            setSuccess(`Usuário "${response.data.nome}" cadastrado com sucesso! ID: ${response.data.id}`);
            setFormData(FORM_INICIAL);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                'Erro ao cadastrar usuário.'
            );
        } finally {
            setLoading(false);
        }
    };

    const formularioValido =
        formData.nome.trim() &&
        formData.email.trim() &&
        formData.senha.trim() &&
        formData.cargo;

    return (
        <Dashboard>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                {/* Cabeçalho */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <PersonAdd color="primary" sx={{ fontSize: 36 }} />
                    <Box>
                        <Typography variant="h4" fontWeight="800" color="primary">
                            Cadastrar Usuário
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Adicione um novo funcionário ao sistema
                        </Typography>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="subtitle1" fontWeight="600" color="text.secondary" sx={{ mb: 2 }}>
                            Dados Pessoais
                        </Typography>

                        <TextField
                            fullWidth name="nome" label="Nome Completo"
                            margin="dense" required
                            value={formData.nome} onChange={handleChange}
                            placeholder="Ex: João da Silva"
                        />
                        <TextField
                            fullWidth name="email" label="E-mail Institucional"
                            type="email" margin="dense" required
                            value={formData.email} onChange={handleChange}
                            placeholder="joao.silva@vitalmed.com"
                        />

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="subtitle1" fontWeight="600" color="text.secondary" sx={{ mb: 2 }}>
                            Acesso ao Sistema
                        </Typography>

                        <TextField
                            fullWidth name="senha" label="Senha Inicial"
                            type="password" margin="dense" required
                            value={formData.senha} onChange={handleChange}
                            helperText="Mínimo recomendado: 8 caracteres."
                        />

                        <FormControl fullWidth margin="dense" required>
                            <InputLabel>Cargo</InputLabel>
                            <Select
                                name="cargo" value={formData.cargo}
                                label="Cargo" onChange={handleChange}
                            >
                                {CARGOS.map((c) => (
                                    <MenuItem key={c} value={c}>{c}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                O cargo define as permissões de acesso do usuário.
                            </FormHelperText>
                        </FormControl>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={!formularioValido || loading}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PersonAdd />}
                            sx={{ mt: 4, borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                        >
                            {loading ? 'Cadastrando...' : 'Registrar Usuário'}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Dashboard>
    );
}