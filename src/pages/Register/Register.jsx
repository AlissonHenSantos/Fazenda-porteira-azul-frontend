
import { useState } from 'react'
import './Register.css'
import client from '../../config/Client'

export default function Register() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)
        try {
            const res = await client.post('/users', { username, email, password })
            const data = res.data
            setSuccess('Registro realizado com sucesso')
            if (data.token) localStorage.setItem('token', data.token)
        } catch (err) {
            if (err.response) setError(err.response.data?.message || 'Erro no registro')
            else setError('Não foi possível conectar ao servidor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <form className="register-card" onSubmit={handleSubmit}>
                <h2 className="brand">Porteira Azul</h2>

                <label className="input-group">
                    <i className="fa fa-user icon" aria-hidden="true"></i>
                    <input
                        type="text"
                        placeholder="Nome de usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                </label>

                <label className="input-group">
                    <i className="fa fa-envelope icon" aria-hidden="true"></i>
                    <input
                        type="email"
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
                        autoComplete="new-password"
                    />
                </label>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar'}
                </button>
            </form>
        </div>
    )
}