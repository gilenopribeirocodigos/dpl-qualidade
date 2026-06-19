import { useState } from 'react'
import { fazerLogin } from '../lib/supabase.js'

export default function Login({ onLogin }) {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro,  setErro]  = useState('')
  const [loading, setLoading] = useState(false)

  const entrar = async () => {
    setErro('')
    if (!login || !senha) { setErro('Preencha login e senha.'); return }
    setLoading(true)
    try {
      const u = await fazerLogin(login, senha)
      onLogin(u)
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>📓</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
          DPL <span style={{ color: '#fbbf24' }}>Qualidade</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
          Roteiro Operacional de Turno
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <p className="label">Usuário</p>
          <input
            className="input-field"
            placeholder="seu.login"
            value={login}
            onChange={e => setLogin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && entrar()}
            autoCapitalize="none"
          />
        </div>
        <div>
          <p className="label">Senha</p>
          <input
            className="input-field"
            type="password"
            placeholder="••••••"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && entrar()}
          />
        </div>

        {erro && (
          <div style={{
            background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fca5a5',
          }}>
            ❌ {erro}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={entrar}
          disabled={loading}
          style={{ marginTop: 6, padding: '16px', fontSize: 16 }}
        >
          {loading ? '⏳ Entrando...' : '🔐 Entrar'}
        </button>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 40 }}>
        DPL Construções · © 2026
      </p>
    </div>
  )
}
