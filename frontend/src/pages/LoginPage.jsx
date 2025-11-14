import React, { useState } from 'react';
import { authAPI } from '../services/api';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <form onSubmit={handleLogin}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#007bff' }}>
          🚢 FerryPass
        </h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label>Email do Operador</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Conectando...' : 'Entrar'}
        </button>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
          Use credenciais de operador para acessar o sistema
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
