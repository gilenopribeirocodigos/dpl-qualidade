import { useState, useEffect } from 'react'
import { TAREFAS, STATUS_OPCOES, horaParaTurno, dataHoje } from '../lib/tarefas.js'
import { salvarRegistroDiario, buscarRegistrosDia } from '../lib/supabase.js'

export default function Roteiro({ usuario, onVerHistorico }) {
  const turno = usuario.turno || 'MANHA'
  const hoje  = dataHoje()

  const [registros,  setRegistros]  = useState({})   // { tarefa_id: { status, observacao } }
  const [salvando,   setSalvando]   = useState(null)  // id da tarefa sendo salva
  const [msgSalvo,   setMsgSalvo]   = useState(null)
  const [loading,    setLoading]    = useState(true)

  // Carrega registros do dia ao abrir
  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      const dados = await buscarRegistrosDia(usuario.id, hoje)
      const mapa = {}
      dados.forEach(d => {
        mapa[d.tarefa_id] = { status: d.status, observacao: d.observacao || '' }
      })
      setRegistros(mapa)
      setLoading(false)
    }
    carregar()
  }, [])

  const atualizar = (tarefa_id, campo, valor) => {
    setRegistros(prev => ({
      ...prev,
      [tarefa_id]: { ...(prev[tarefa_id] || { status: '', observacao: '' }), [campo]: valor }
    }))
  }

  const salvar = async (tarefa) => {
    const reg = registros[tarefa.id] || {}
    if (!reg.status) { alert('Selecione o status antes de salvar.'); return }
    setSalvando(tarefa.id)
    try {
      await salvarRegistroDiario({
        aprendiz_id:   usuario.id,
        data_registro: hoje,
        tarefa_id:     tarefa.id,
        tarefa_titulo: tarefa.titulo,
        turno,
        status:        reg.status,
        observacao:    reg.observacao || '',
        hora_registro: new Date().toTimeString().slice(0, 5),
      })
      setMsgSalvo(tarefa.id)
      setTimeout(() => setMsgSalvo(null), 2000)
    } catch (e) {
      alert('Erro ao salvar: ' + e.message)
    } finally {
      setSalvando(null)
    }
  }

  const totalFeitas = Object.values(registros).filter(r => r.status === 'feito').length
  const totalTarefas = TAREFAS.length

  const corTurno = turno === 'MANHA'
    ? { bg: '#1e40af', badge: '#dbeafe', badgeText: '#1e3a8a', label: '☀️ Turno Manhã', horas: '08:00 – 12:00' }
    : { bg: '#b45309', badge: '#fef3c7', badgeText: '#78350f', label: '🌤️ Turno Tarde', horas: '13:00 – 17:00' }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.6)' }}>
      ⏳ Carregando roteiro...
    </div>
  )

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>

      {/* Header turno */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 14, padding: '14px 18px', marginBottom: 16,
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{corTurno.label}</p>
            <p style={{ fontSize: 20, fontWeight: 800 }}>{corTurno.horas}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
              {hoje.split('-').reverse().join('/')}
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#86efac' }}>
              {totalFeitas}/{totalTarefas} concluídas
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{
          marginTop: 10, height: 6, background: 'rgba(255,255,255,0.15)',
          borderRadius: 3, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: totalFeitas === totalTarefas ? '#16a34a' : '#60a5fa',
            width: `${(totalFeitas / totalTarefas) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Lista de tarefas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TAREFAS.map(tarefa => {
          const reg    = registros[tarefa.id] || { status: '', observacao: '' }
          const hora   = horaParaTurno(tarefa, turno)
          const salvo  = msgSalvo === tarefa.id
          const salvandoEsta = salvando === tarefa.id
          const statusInfo = STATUS_OPCOES.find(s => s.valor === reg.status)

          return (
            <div key={tarefa.id} style={{
              background: '#fff',
              borderRadius: 14,
              padding: '14px 16px',
              color: '#1e293b',
              border: reg.status === 'feito' ? '2px solid #16a34a'
                    : reg.status === 'ocorrencia' ? '2px solid #dc2626'
                    : '2px solid transparent',
            }}>
              {/* Título */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{
                  background: corTurno.badge, color: corTurno.badgeText,
                  fontSize: 11, fontWeight: 700, padding: '3px 8px',
                  borderRadius: 6, whiteSpace: 'nowrap', marginTop: 2,
                }}>{hora}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                    {tarefa.icone} {tarefa.titulo}
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                    {tarefa.descricao}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {STATUS_OPCOES.map(opt => (
                  <button
                    key={opt.valor}
                    onClick={() => atualizar(tarefa.id, 'status', opt.valor)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                      border: reg.status === opt.valor ? `2px solid ${opt.cor}` : '2px solid #e2e8f0',
                      background: reg.status === opt.valor ? opt.bg : '#f8fafc',
                      color: reg.status === opt.valor ? opt.cor : '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Observação */}
              <textarea
                placeholder="Observação / ocorrência (opcional)..."
                value={reg.observacao}
                onChange={e => atualizar(tarefa.id, 'observacao', e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: 13, color: '#1e293b',
                  background: '#f8fafc', marginBottom: 10, lineHeight: 1.5,
                }}
              />

              {/* Botão salvar */}
              <button
                onClick={() => salvar(tarefa)}
                disabled={salvandoEsta || !reg.status}
                style={{
                  width: '100%', padding: '10px', borderRadius: 10,
                  border: 'none', fontWeight: 700, fontSize: 14,
                  background: salvo ? '#16a34a'
                              : salvandoEsta ? '#64748b'
                              : !reg.status ? '#e2e8f0'
                              : '#2563eb',
                  color: !reg.status ? '#94a3b8' : '#fff',
                  cursor: !reg.status || salvandoEsta ? 'not-allowed' : 'pointer',
                }}
              >
                {salvo ? '✅ Salvo!' : salvandoEsta ? '⏳ Salvando...' : '💾 Salvar registro'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Botão histórico */}
      <button
        className="btn-ghost"
        onClick={onVerHistorico}
        style={{ marginTop: 24 }}
      >
        📁 Ver meu histórico
      </button>
    </div>
  )
}
