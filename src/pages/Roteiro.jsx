import { useState, useEffect } from 'react'
import { TAREFAS, STATUS_OPCOES, horaParaTurno, dataHoje } from '../lib/tarefas.js'
import { supabase } from '../lib/supabase.js'

async function salvarRegistro(payload) {
  if (!supabase) throw new Error('Supabase não configurado.')
  const { data, error } = await supabase
    .from('diario_aprendiz')
    .insert(payload)
    .select()
  if (error) throw error
  return data
}

async function buscarRegistrosDia(aprendiz_id, data_registro) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('diario_aprendiz')
    .select('*')
    .eq('aprendiz_id', aprendiz_id)
    .eq('data_registro', data_registro)
    .order('criado_em', { ascending: false })
  if (error) return []
  return data || []
}

const COR_STATUS = {
  feito:      { bg: '#dcfce7', cor: '#166534', label: '✅ Concluído'  },
  pendente:   { bg: '#fef3c7', cor: '#92400e', label: '⏳ Pendente'   },
  ocorrencia: { bg: '#fee2e2', cor: '#991b1b', label: '🚨 Ocorrência' },
}

export default function Roteiro({ usuario, onVerHistorico }) {
  const turno = usuario.turno || 'MANHA'
  const hoje  = dataHoje()

  const [registros,   setRegistros]   = useState([])
  const [modal,       setModal]       = useState(null)   // tarefa selecionada
  const [form,        setForm]        = useState({ status: '', observacao: '' })
  const [salvando,    setSalvando]    = useState(false)
  const [loading,     setLoading]     = useState(true)

  const carregar = async () => {
    setLoading(true)
    const dados = await buscarRegistrosDia(usuario.id, hoje)
    setRegistros(dados)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const abrirModal = (tarefa) => {
    setModal(tarefa)
    setForm({ status: '', observacao: '' })
  }

  const fecharModal = () => {
    setModal(null)
    setForm({ status: '', observacao: '' })
  }

  const salvar = async () => {
    if (!form.status) { alert('Selecione o status.'); return }
    setSalvando(true)
    try {
      await salvarRegistro({
        aprendiz_id:   usuario.id,
        data_registro: hoje,
        tarefa_id:     modal.id,
        tarefa_titulo: modal.titulo,
        turno,
        status:        form.status,
        observacao:    form.observacao || '',
        hora_registro: new Date().toTimeString().slice(0, 5),
      })
      fecharModal()
      carregar()
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  // Conta registros por tarefa
  const contagemPorTarefa = registros.reduce((acc, r) => {
    acc[r.tarefa_id] = (acc[r.tarefa_id] || 0) + 1
    return acc
  }, {})

  const totalRegistros = registros.length

  const corTurno = turno === 'MANHA'
    ? { badge: '#dbeafe', badgeText: '#1e3a8a' }
    : { badge: '#fef3c7', badgeText: '#78350f' }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>

      {/* Header do turno */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 14, padding: '14px 18px', marginBottom: 20,
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
              {turno === 'MANHA' ? '☀️ Turno Manhã' : '🌤️ Turno Tarde'}
            </p>
            <p style={{ fontSize: 20, fontWeight: 800 }}>
              {turno === 'MANHA' ? '08:00 – 12:00' : '13:00 – 17:00'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
              {hoje.split('-').reverse().join('/')}
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#86efac' }}>
              {totalRegistros} registro{totalRegistros !== 1 ? 's' : ''} hoje
            </p>
          </div>
        </div>
      </div>

      {/* Botões de tarefa */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        Toque para registrar uma atividade
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {TAREFAS.map(tarefa => {
          const qtd  = contagemPorTarefa[tarefa.id] || 0
          const hora = horaParaTurno(tarefa, turno)

          return (
            <button
              key={tarefa.id}
              onClick={() => abrirModal(tarefa)}
              style={{
                background: '#fff',
                border: qtd > 0 ? '2px solid #2563eb' : '2px solid transparent',
                borderRadius: 14,
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                transition: 'transform 0.1s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Ícone */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: qtd > 0 ? '#dbeafe' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {tarefa.icone}
              </div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>
                  {tarefa.titulo}
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>{hora}</p>
              </div>

              {/* Badge de quantidade */}
              <div style={{
                flexShrink: 0,
                background: qtd > 0 ? '#2563eb' : '#e2e8f0',
                color: qtd > 0 ? '#fff' : '#94a3b8',
                borderRadius: 20, minWidth: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, padding: '0 8px',
              }}>
                {qtd > 0 ? `+${qtd}` : '＋'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Registros do dia */}
      {!loading && registros.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Registros de hoje ({registros.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {registros.map((r, i) => {
              const s = COR_STATUS[r.status] || COR_STATUS.pendente
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: 12, padding: '11px 14px',
                  color: '#1e293b', borderLeft: `4px solid ${s.cor}`,
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{r.tarefa_titulo}</p>
                    {r.observacao && (
                      <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>💬 {r.observacao}</p>
                    )}
                    <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{r.hora_registro}h</p>
                  </div>
                  <span style={{
                    background: s.bg, color: s.cor,
                    fontSize: 10, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap',
                  }}>{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button className="btn-ghost" onClick={onVerHistorico} style={{ marginTop: 20 }}>
        📁 Ver histórico completo
      </button>

      {/* ── MODAL ── */}
      {modal && (
        <div
          onClick={fecharModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 0 0 0',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '20px 20px 0 0',
              padding: '24px 20px 36px',
              width: '100%', maxWidth: 480,
              animation: 'slideUp 0.2s ease',
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

            {/* Handle */}
            <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 20px' }} />

            {/* Título */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: '#eff6ff', fontSize: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{modal.icone}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{modal.titulo}</p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>{modal.descricao}</p>
              </div>
            </div>

            {/* Status */}
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Status</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {STATUS_OPCOES.map(opt => (
                <button
                  key={opt.valor}
                  onClick={() => setForm(f => ({ ...f, status: opt.valor }))}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                    border: form.status === opt.valor ? `2px solid ${opt.cor}` : '2px solid #e2e8f0',
                    background: form.status === opt.valor ? opt.bg : '#f8fafc',
                    color: form.status === opt.valor ? opt.cor : '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Observação */}
            <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Observação</p>
            <textarea
              placeholder="Descreva o que foi feito, quem foi contatado, ocorrência encontrada..."
              value={form.observacao}
              onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
              style={{
                width: '100%', padding: '12px', borderRadius: 12,
                border: '1px solid #e2e8f0', fontSize: 13, color: '#1e293b',
                background: '#f8fafc', marginBottom: 16, lineHeight: 1.5,
                minHeight: 90,
              }}
            />

            {/* Botões */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={fecharModal} style={{
                flex: 1, padding: '14px', borderRadius: 12,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                color: '#64748b', fontWeight: 700, fontSize: 14,
              }}>Cancelar</button>
              <button
                onClick={salvar}
                disabled={salvando || !form.status}
                style={{
                  flex: 2, padding: '14px', borderRadius: 12, border: 'none',
                  background: !form.status ? '#e2e8f0' : salvando ? '#64748b' : '#2563eb',
                  color: !form.status ? '#94a3b8' : '#fff',
                  fontWeight: 800, fontSize: 14,
                  cursor: !form.status || salvando ? 'not-allowed' : 'pointer',
                }}
              >
                {salvando ? '⏳ Salvando...' : '💾 Salvar registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
