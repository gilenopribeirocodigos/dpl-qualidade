import { createClient } from '@supabase/supabase-js'

const url    = import.meta.env.VITE_SUPABASE_URL
const key    = import.meta.env.VITE_SUPABASE_ANON_KEY
const schema = import.meta.env.VITE_SUPABASE_SCHEMA || 'public'

export const supabase = (url && key)
  ? createClient(url, key, { db: { schema } })
  : null

const SESSION_KEY = 'dpl_qualidade_user'

export function getUsuarioLogado() {
  try {
    const s = localStorage.getItem(SESSION_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function salvarSessao(usuario) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario))
}

export function fazerLogout() {
  localStorage.removeItem(SESSION_KEY)
}

export async function fazerLogin(login, senha) {
  if (!supabase) throw new Error('Supabase não configurado.')

  const { data, error } = await supabase
    .from('aprendizes')
    .select('*')
    .eq('login', login.trim().toLowerCase())
    .eq('ativo', true)

  if (error) throw new Error('Erro de conexão.')
  if (!data || data.length === 0) throw new Error('Usuário não encontrado ou inativo.')

  const u = data[0]
  if (u.senha !== senha) throw new Error('Senha incorreta.')

  const sessao = { id: u.id, nome: u.nome, login: u.login, perfil: u.perfil, turno: u.turno }
  salvarSessao(sessao)
  return sessao
}

export async function salvarRegistroDiario(payload) {
  if (!supabase) throw new Error('Supabase não configurado.')
  const { data, error } = await supabase
    .from('diario_aprendiz')
    .upsert(payload, { onConflict: 'aprendiz_id,data_registro,tarefa_id' })
    .select()
  if (error) throw error
  return data
}

export async function buscarRegistrosDia(aprendiz_id, data_registro) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('diario_aprendiz')
    .select('*')
    .eq('aprendiz_id', aprendiz_id)
    .eq('data_registro', data_registro)
  if (error) return []
  return data || []
}

export async function buscarHistorico(aprendiz_id, limite = 30) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('diario_aprendiz')
    .select('*')
    .eq('aprendiz_id', aprendiz_id)
    .order('data_registro', { ascending: false })
    .order('tarefa_id', { ascending: true })
    .limit(limite)
  if (error) return []
  return data || []
}

export async function buscarTodosRegistros(data_registro) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('diario_aprendiz')
    .select('*, aprendizes(nome, turno)')
    .eq('data_registro', data_registro)
    .order('aprendiz_id')
    .order('tarefa_id')
  if (error) return []
  return data || []
}
