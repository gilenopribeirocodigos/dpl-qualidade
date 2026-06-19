import { useState, useEffect } from 'react'
import { buscarTodosRegistros } from '../lib/supabase.js'
import { dataHoje } from '../lib/tarefas.js'

const COR_STATUS = {
  feito:      { bg: '#dcfce7', cor: '#166534', label: '✅ Concluído'  },
  pendente:   { bg: '#fef3c7', cor: '#92400e', label: '⏳ Pendente'   },
  ocorrencia: { bg: '#fee2e2', cor: '#991b1b', label: '🚨 Ocorrência' },
}

export default function PainelAdmin({ onVoltar }) {
  const [data,      setData]      = useState(dataHoje())
  const [registros, setRegistros] = useState([])
  const [loading,   setLoading]   = useState(false)

  const carregar = async (d) => {
    setLoading(true)
    const dados = await buscarTodosRegistros(d)
    setRegistros(dados)
    setLoading(false)
  }

  useEffect(() => { carregar(data) }, [data])

  // Agrupa por aprendiz
  const porAprendiz = registros.reduce((acc, r) => {
    const nome = r.aprendizes?.nome || `Aprendiz ${r.aprendiz_id}`
    if (!acc[nome]) acc[nome] = { turno: r.turno, regs: [] }
    acc[nome].regs.push(r)
    return acc
  }, {})

  const formatarData = (iso) => {
    const [a, m, d] = iso.split('-')
    return `${d}/${m}/${a}`
  }

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onVoltar} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: '#fff', padding: '8px 14px', borderRadius: 10,
          fontSize: 13, fontWeight: 700,
        }}>← Voltar</button>
        <div>
          <p style={{ fontSize: 16, fontWeight: 800 }}>👨‍💼 Painel Coordenador</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Acompanhamento dos aprendizes</p>
        </div>
      </div>

      {/* Filtro de data */}
      <div style={{ marginBottom: 20 }}>
        <p className="label">Selecionar data</p>
        <input
          type="date"
          className="input-field"
          value={data}
          onChange={e => setData(e.target.value)}
          style={{ maxWidth: 200 }}
        />
      </div>

      {loading && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}>
          ⏳ Carregando...
        </p>
      )}

      {!loading && Object.keys(porAprendiz).length === 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 32,
          textAlign: 'center', color: 'rgba(255,255,255,0.5)',
        }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
          <p>Nenhum registro para {formatarData(data)}.</p>
        </div>
      )}

      {Object.entries(porAprendiz).map(([nome, { turno, regs }]) => {
        const feitas     = regs.filter(r => r.status === 'feito').length
        const ocorrencias = regs.filter(r => r.status === 'ocorrencia').length

        return (
          <div key={nome} style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 16,
          }}>
            {/* Header aprendiz */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>👤 {nome}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                  {turno === 'MANHA' ? '☀️ Turno Manhã' : '🌤️ Turno Tarde'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: feitas === 7 ? '#86efac' : '#fbbf24' }}>
                  {feitas}/7 ✅
                </p>
                {ocorrencias > 0 && (
                  <p style={{ fontSize: 12, color: '#fca5a5' }}>{ocorrencias} 🚨</p>
                )}
              </div>
            </div>

            {/* Registros */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {regs.map((r, i) => {
                const s = COR_STATUS[r.status] || COR_STATUS.pendente
                return (
                  <div key={i} style={{
                    background: '#fff', borderRadius: 10, padding: '10px 12px',
                    color: '#1e293b', borderLeft: `3px solid ${s.cor}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{r.tarefa_titulo}</p>
                      <span style={{
                        background: s.bg, color: s.cor,
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap',
                      }}>{s.label}</span>
                    </div>
                    {r.observacao && (
                      <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        💬 {r.observacao}
                      </p>
                    )}
                    <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                      Registrado às {r.hora_registro}h
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
