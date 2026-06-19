import { useState } from 'react'
import { getUsuarioLogado, fazerLogout } from './lib/supabase.js'
import Login          from './pages/Login.jsx'
import Roteiro        from './pages/Roteiro.jsx'
import Historico      from './pages/Historico.jsx'
import PainelAdmin    from './pages/PainelAdmin.jsx'
import GestaoUsuarios from './pages/GestaoUsuarios.jsx'

export default function App() {
  const [usuario, setUsuario] = useState(getUsuarioLogado)
  const [tela,    setTela]    = useState('roteiro')

  const logout = () => {
    fazerLogout()
    setUsuario(null)
    setTela('roteiro')
  }

  if (!usuario) return <Login onLogin={u => { setUsuario(u); setTela('roteiro') }} />

  const isAdmin = usuario.perfil === 'ADMIN'

  return (
    <div className="app-shell">

      {/* Header */}
      <div style={{
        width: '100%', maxWidth: 420,
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
      }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800 }}>
            📓 DPL <span style={{ color: '#fbbf24' }}>Qualidade</span>
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            {usuario.nome} · {usuario.turno === 'MANHA' ? '☀️ Manhã' : usuario.turno === 'TARDE' ? '🌤️ Tarde' : '👨‍💼 Admin'}
          </p>
        </div>

        {/* Botões admin */}
        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && tela !== 'admin' && (
            <button onClick={() => setTela('admin')} style={{
              background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.4)',
              color: '#fbbf24', padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            }}>📊 Painel</button>
          )}
          {isAdmin && tela !== 'usuarios' && (
            <button onClick={() => setTela('usuarios')} style={{
              background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
              color: '#c4b5fd', padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            }}>👥 Usuários</button>
          )}
          {isAdmin && (tela === 'admin' || tela === 'usuarios') && (
            <button onClick={() => setTela('roteiro')} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            }}>🏠 Home</button>
          )}
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: '#fff', padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          }}>Sair</button>
        </div>
      </div>

      {/* Telas */}
      {tela === 'roteiro'  && <Roteiro        usuario={usuario} onVerHistorico={() => setTela('historico')} />}
      {tela === 'historico'&& <Historico      usuario={usuario} onVoltar={() => setTela('roteiro')} />}
      {tela === 'admin'    && <PainelAdmin    onVoltar={() => setTela('roteiro')} />}
      {tela === 'usuarios' && <GestaoUsuarios onVoltar={() => setTela('roteiro')} />}
    </div>
  )
}
