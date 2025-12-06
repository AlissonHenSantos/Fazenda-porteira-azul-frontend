// ...existing code...
import { useState } from 'react'
import './Login.css'
import client from '../../config/Client' // ajuste o caminho se necessário

export default function  Login () {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const res = await client.post('/login', { email, password });
            const data = res.data;
            setSuccess('Login realizado com sucesso');
            if (data.token) localStorage.setItem('token', data.token);
        } catch (err) {
            if (err.response) {
                setError(err.response.data?.message || 'Erro no login');
            } else {
                setError('Não foi possível conectar ao servidor');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2 className="brand">Porteira Azul</h2>

                <label className="input-group">
                    <i className="fa fa-user icon" aria-hidden="true"></i>
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </label>

                <label className="input-group">
                    <i className="fa fa-lock icon" aria-hidden="true"></i>
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </label>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    )
}
