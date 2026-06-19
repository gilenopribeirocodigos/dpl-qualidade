import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export default function GestaoUsuarios({ onVoltar }) {
  const [usuarios, setUsuarios] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [form,     setForm]     = useState({ nome: '', login: '', senha: '', turno: 'MANHA', perfil: 'APRENDIZ' })
  const [salvando, setSalvando] = useState(false)
  const [msg,      setMsg]      = useState(null)
  const [editando, setEditando] = useState(null)

  const carregar = async () => {
    setLoading(true)
    const { data } = await supabase.from('aprendizes').select('*').order('nome')
    setUsuarios(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const limparForm = () => {
    setForm({ nome: '', login: '', senha: '', turno: 'MANHA', perfil: 'APRENDIZ' })
    setEditando(null)
  }

  const salvar = async () => {
    if (!form.nome || !form.login || (!editando && !form.senha)) {
      setMsg({ tipo: 'erro', texto: 'Preencha nome, login e senha.' })
      return
    }
    setSalvando(true)
    try {
      if (editando) {
        const payload = { nome: form.nome, login: form.login.toLowerCase(), turno: form.turno, perfil: form.perfil }
        if (form.senha) payload.senha = form.senha
        const { error } = await supabase.from('aprendizes').update(payload).eq('id', editando)
        if (error) throw error
        setMsg({ tipo: 'ok', texto: '✅ Usuário atualizado!' })
      } else {
        const { error } = await supabase.from('aprendizes').insert({
          nome:   form.nome,
          login:  form.login.toLowerCase(),
          senha:  form.senha,
          turno:  form.turno,
          perfil: form.perfil,
          ativo:  true,
        })
        if (error) throw error
        setMsg({ tipo: 'ok', texto: '✅ Usuário cadastrado!' })
      }
      limparForm()
      carregar()
    } catch (e) {
      setMsg({ tipo: 'erro', texto: '❌ ' + (e.message.includes('unique') ? 'Login já existe.' : e.message) })
    } finally {
      setSalvando(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  const toggleAtivo = async (u) => {
    await supabase.from('aprendizes').update({ ativo: !u.ativo }).eq('id', u.id)
    carregar()
  }

  const iniciarEdicao = (u) => {
    setEditando(u.id)
    setForm({ nome: u.nome, login: u.login, senha: '', turno: u.turno, perfil: u.perfil })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inp = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  const estilo = {
    label: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' },
    input: { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14 },
    select: { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: '#1e3a5f', color: '#fff', fontSize: 14 },
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onVoltar} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: '#fff', padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
        }}>← Voltar</button>
        <div>
          <p style={{ fontSize: 16, fontWeight: 800 }}>👥 Gestão de Usuários</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Cadastrar e gerenciar aprendizes</p>
        </div>
      </div>

      {/* Formulário */}
      <div style={{
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 14, padding: 16, marginBottom: 20,
      }}>
        <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>
          {editando ? '✏️ Editar usuário' : '➕ Novo usuário'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={estilo.label}>Nome completo</label>
            <input style={estilo.input} placeholder="Ex: João da Silva" value={form.nome} onChange={e => inp('nome', e.target.value)} />
          </div>
          <div>
            <label style={estilo.label}>Login</label>
            <input style={estilo.input} placeholder="Ex: joao.silva" value={form.login} onChange={e => inp('login', e.target.value)} autoCapitalize="none" />
          </div>
          <div>
            <label style={estilo.label}>{editando ? 'Nova senha (deixe vazio para manter)' : 'Senha'}</label>
            <input style={estilo.input} type="password" placeholder="••••••" value={form.senha} onChange={e => inp('senha', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={estilo.label}>Turno</label>
              <select style={estilo.select} value={form.turno} onChange={e => inp('turno', e.target.value)}>
                <option value="MANHA">☀️ Manhã</option>
                <option value="TARDE">🌤️ Tarde</option>
              </select>
            </div>
            <div>
              <label style={estilo.label}>Perfil</label>
              <select style={estilo.select} value={form.perfil} onChange={e => inp('perfil', e.target.value)}>
                <option value="APRENDIZ">Aprendiz</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {msg && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 10, fontSize: 13,
            background: msg.tipo === 'ok' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)',
            color: msg.tipo === 'ok' ? '#86efac' : '#fca5a5',
            border: `1px solid ${msg.tipo === 'ok' ? 'rgba(22,163,74,0.4)' : 'rgba(220,38,38,0.4)'}`,
          }}>{msg.texto}</div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={salvar} disabled={salvando} style={{
            flex: 1, padding: '12px', borderRadius: 10, border: 'none',
            background: salvando ? '#64748b' : '#2563eb',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {salvando ? '⏳ Salvando...' : editando ? '💾 Atualizar' : '➕ Cadastrar'}
          </button>
          {editando && (
            <button onClick={limparForm} style={{
              padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 14,
            }}>Cancelar</button>
          )}
        </div>
      </div>

      {/* Lista de usuários */}
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
        Usuários cadastrados ({usuarios.length})
      </p>

      {loading && <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 20 }}>⏳ Carregando...</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {usuarios.map(u => (
          <div key={u.id} style={{
            background: '#fff', borderRadius: 12, padding: '12px 14px',
            color: '#1e293b', opacity: u.ativo ? 1 : 0.5,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{u.nome}</p>
              <p style={{ fontSize: 12, color: '#64748b' }}>
                @{u.login} · {u.turno === 'MANHA' ? '☀️ Manhã' : '🌤️ Tarde'} · {u.perfil}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => iniciarEdicao(u)} style={{
                padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#f8fafc', fontSize: 12, fontWeight: 700, color: '#2563eb',
              }}>✏️</button>
              <button onClick={() => toggleAtivo(u)} style={{
                padding: '6px 10px', borderRadius: 8, border: 'none',
                background: u.ativo ? '#fee2e2' : '#dcfce7',
                fontSize: 12, fontWeight: 700,
                color: u.ativo ? '#dc2626' : '#16a34a',
              }}>{u.ativo ? '🚫' : '✅'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
