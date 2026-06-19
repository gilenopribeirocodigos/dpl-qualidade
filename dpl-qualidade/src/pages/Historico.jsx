import { useState, useEffect } from 'react'
import { buscarHistorico } from '../lib/supabase.js'

const COR_STATUS = {
  feito:      { bg: '#dcfce7', cor: '#166534', label: '✅ Concluído'  },
  pendente:   { bg: '#fef3c7', cor: '#92400e', label: '⏳ Pendente'   },
  ocorrencia: { bg: '#fee2e2', cor: '#991b1b', label: '🚨 Ocorrência' },
}

export default function Historico({ usuario, onVoltar }) {
  const [registros, setRegistros] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      const dados = await buscarHistorico(usuario.id, 60)
      setRegistros(dados)
      setLoading(false)
    }
    carregar()
  }, [])

  // Agrupa por data
  const porData = registros.reduce((acc, r) => {
    if (!acc[r.data_registro]) acc[r.data_registro] = []
    acc[r.data_registro].push(r)
    return acc
  }, {})

  const formatarData = (iso) => {
    const [a, m, d] = iso.split('-')
    return `${d}/${m}/${a}`
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onVoltar} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: '#fff', padding: '8px 14px', borderRadius: 10,
          fontSize: 13, fontWeight: 700,
        }}>← Voltar</button>
        <div>
          <p style={{ fontSize: 16, fontWeight: 800 }}>📁 Meu Histórico</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Últimos 60 registros</p>
        </div>
      </div>

      {loading && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}>
          ⏳ Carregando...
        </p>
      )}

      {!loading && Object.keys(porData).length === 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 32,
          textAlign: 'center', color: 'rgba(255,255,255,0.5)',
        }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
          <p>Nenhum registro encontrado ainda.</p>
        </div>
      )}

      {Object.entries(porData).map(([data, regs]) => {
        const feitas = regs.filter(r => r.status === 'feito').length
        return (
          <div key={data} style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 8,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                📅 {formatarData(data)}
              </p>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: feitas === regs.length ? '#86efac' : '#fbbf24',
              }}>
                {feitas}/{regs.length} concluídas
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {regs.map((r, i) => {
                const s = COR_STATUS[r.status] || COR_STATUS.pendente
                return (
                  <div key={i} style={{
                    background: '#fff', borderRadius: 12, padding: '12px 14px',
                    color: '#1e293b', borderLeft: `4px solid ${s.cor}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{r.tarefa_titulo}</p>
                      <span style={{
                        background: s.bg, color: s.cor,
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap',
                      }}>{s.label}</span>
                    </div>
                    {r.observacao && (
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>
                        💬 {r.observacao}
                      </p>
                    )}
                    <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                      {r.turno === 'MANHA' ? '☀️ Manhã' : '🌤️ Tarde'} · {r.hora_registro}h
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
