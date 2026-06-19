// Tarefas do Roteiro Operacional de Turno
// Usadas nos dois turnos — a hora exibida muda conforme o turno

export const TAREFAS = [
  {
    id: 1,
    icone: '🖥️',
    titulo: 'Verificar login da equipe no SIGA',
    descricao: 'Acessar o SIGA, conferir horário de login de cada fiscal, cobrar os ausentes e registrar ocorrências.',
    hora_manha: '08:00',
    hora_tarde: '13:00',
  },
  {
    id: 2,
    icone: '👥',
    titulo: 'Registrar frequência e indisponibilidades',
    descricao: 'Lançar a frequência dos empregados e registrar indisponibilidades das equipes no sistema.',
    hora_manha: '08:30',
    hora_tarde: '13:30',
  },
  {
    id: 3,
    icone: '📲',
    titulo: 'Lançar CARD de indisponibilidade no WhatsApp',
    descricao: 'Publicar o CARD de indisponibilidade por fiscal/equipe nos grupos de WhatsApp.',
    hora_manha: '09:00',
    hora_tarde: '14:00',
  },
  {
    id: 4,
    icone: '📸',
    titulo: 'Acompanhar aderência de fotos das equipes',
    descricao: 'Verificar fotos enviadas. Ligar para fiscal/equipe com atraso ou baixa aderência.',
    hora_manha: '09:30',
    hora_tarde: '14:30',
  },
  {
    id: 5,
    icone: '⚠️',
    titulo: 'Verificar rejeições de liga nova',
    descricao: 'Avaliar motivos das rejeições e contatar o fiscal para verificar se estava ciente.',
    hora_manha: '10:00',
    hora_tarde: '15:00',
  },
  {
    id: 6,
    icone: '⏱️',
    titulo: 'Acompanhar tempo de execução e deslocamento',
    descricao: 'Monitorar execução e deslocamento. Ligar para cobrar agilidade nos casos em atraso.',
    hora_manha: '10:30',
    hora_tarde: '15:30',
  },
  {
    id: 7,
    icone: '📋',
    titulo: 'Gerar auditoria de corte sem religa',
    descricao: 'Gerar relatório de auditoria de corte sem religa e auditar as religas vinculadas.',
    hora_manha: '11:00',
    hora_tarde: '16:00',
  },
]

export const STATUS_OPCOES = [
  { valor: 'feito',     label: 'Concluído',  cor: '#16a34a', bg: '#dcfce7' },
  { valor: 'pendente',  label: 'Pendente',   cor: '#d97706', bg: '#fef3c7' },
  { valor: 'ocorrencia',label: 'Ocorrência', cor: '#dc2626', bg: '#fee2e2' },
]

export function horaParaTurno(tarefa, turno) {
  return turno === 'MANHA' ? tarefa.hora_manha : tarefa.hora_tarde
}

export function dataHoje() {
  return new Date().toISOString().slice(0, 10)
}

export function turnoAtual() {
  const h = new Date().getHours()
  return h < 13 ? 'MANHA' : 'TARDE'
}
