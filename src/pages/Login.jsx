    import { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Container, Box, Typography, TextField, Button, Alert, Paper } from '@mui/material';
    import api from '../services/api';

    export default function Login() {
        const [email, setEmail] = useState('');
        const [senha, setSenha] = useState('');
        const [erro, setErro] = useState('');
        const navigate = useNavigate();

        useEffect(() => {
            localStorage.removeItem('token');
        }, []);

        const handleLogin = async (e) => {
            e.preventDefault();
            setErro('');

            try {
                const response = await api.post('/auth/login', { email, senha });
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard'); // Vai para a tela principal (Entrega 5)
            } catch (error) {
                if (error.response?.status === 403 || error.response?.status === 401) {
                    setErro('E-mail ou senha incorretos.');
                } else {
                    setErro('Erro ao conectar com o servidor.');
                }
            }
        };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Um degradê moderno que remete à tecnologia e saúde
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                padding: 2
            }}
        >
            <Container component="main" maxWidth="xs">
                <Paper 
                    elevation={10} 
                    sx={{ 
                        padding: 4, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        borderRadius: 4, // Bordas mais arredondadas para um ar moderno
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Leve transparência
                        backdropFilter: 'blur(10px)' // Efeito de vidro (glassmorphism)
                    }}
                >
                    <Typography 
                        component="h1" 
                        variant="h4" 
                        align="center" 
                        gutterBottom 
                        fontWeight="800" 
                        color="primary"
                    
                    >
                        VitalMed
                    </Typography>
                    <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
                        Logística Hospitalar Inteligente
                    </Typography>

                    {erro && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{erro}</Alert>}

                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="E-mail Institucional"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Senha"
                            type="password"
                            id="senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            variant="outlined"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ 
                                mt: 4, 
                                mb: 2, 
                                py: 1.5, 
                                fontWeight: 'bold',
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            Acessar Sistema
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
    }